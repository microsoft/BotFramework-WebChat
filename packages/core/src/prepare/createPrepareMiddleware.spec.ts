import incomingActivity from '../actions/incomingActivity';
import setNotification from '../actions/setNotification';
import { withOptions } from '../createStore';
import StoreDebugAPIRegistry from '../internal/StoreDebugAPIRegistry';
import reducer from '../reducer';

type Action = { readonly meta?: unknown; readonly type: string };

const ACTIVITY = Object.freeze({ from: { id: 'bot', role: 'bot' }, text: 'Hello', type: 'message' }) as any;

function createStoreWithClock(now: number) {
  const dispatched: Action[] = [];
  const store = withOptions(
    // Only the clock of the ponyfill is faked.
    { ponyfill: { Date: { now: () => now } as DateConstructor } },
    {},
    () => next => action => {
      dispatched.push(action as Action);

      return next(action);
    }
  );

  return { dispatched, store };
}

test('the host middleware and dispatch() see the action as dispatched, the reducers see it prepared', () => {
  const { dispatched, store } = createStoreWithClock(1_000);
  const action = incomingActivity(ACTIVITY);

  expect(store.dispatch(action)).toBe(action);
  expect(dispatched).toEqual([action]);

  const [activity] = store.getState().activities;

  // `meta.now` is the time of the ponyfill's clock, `meta.fallbackId` and `meta.localId` are new IDs.
  expect(activity.channelData['webchat:internal:received-at']).toBe(1_000);
  expect(activity.id).toEqual(expect.any(String));
  expect(activity.channelData['webchat:internal:local-id']).toMatch(/^_:/u);
});

test('a notification is stamped with the time of the ponyfill', () => {
  const { store } = createStoreWithClock(2_000);

  store.dispatch(setNotification({ id: 'n1', level: 'info', message: 'Hello' }));

  expect(store.getState().notifications.n1).toHaveProperty('timestamp', 2_000);
});

test('the side effects of an action run before the nested dispatch of a store listener', async () => {
  const { store } = createStoreWithClock(1_000);
  const breakpoint = jest.fn();

  (StoreDebugAPIRegistry.get(store).breakpoint as any).incomingActivity = breakpoint;

  // A host that adds a disclaimer after the activity, from a store listener.
  store.subscribe(
    () =>
      store.getState().activities.at(-1)?.id === 'a-1' &&
      store.dispatch(incomingActivity({ ...ACTIVITY, id: 'disclaimer' }))
  );

  store.dispatch(incomingActivity({ ...ACTIVITY, id: 'a-1' }));
  await Promise.resolve();

  expect(breakpoint.mock.calls.map(([, { activity }]) => activity.id)).toEqual(['a-1', 'disclaimer']);
});

test('the side effects of an action run when a reducer throws', async () => {
  const { store } = createStoreWithClock(1_000);
  const breakpoint = jest.fn();

  (StoreDebugAPIRegistry.get(store).breakpoint as any).incomingActivity = breakpoint;

  expect(() =>
    // `entities` must be an array.
    store.dispatch(incomingActivity({ ...ACTIVITY, entities: { type: 'https://schema.org/Message' }, id: 'a-1' }))
  ).toThrow(TypeError);
  await Promise.resolve();

  expect(breakpoint).toHaveBeenCalledTimes(1);
  expect(breakpoint.mock.calls[0][1].activity).toHaveProperty('id', 'a-1');
});

test('an update to a concluded livestream session warns and is dropped', () => {
  const { store } = createStoreWithClock(1_000);
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

  store.dispatch(
    incomingActivity({
      ...ACTIVITY,
      channelData: { streamSequence: 1, streamType: 'streaming' },
      id: 'a-1',
      type: 'typing'
    })
  );
  store.dispatch(incomingActivity({ ...ACTIVITY, channelData: { streamId: 'a-1', streamType: 'final' }, id: 'a-2' }));
  store.dispatch(
    incomingActivity({
      ...ACTIVITY,
      channelData: { streamId: 'a-1', streamSequence: 2, streamType: 'streaming' },
      id: 'a-3',
      type: 'typing'
    })
  );

  expect(warn.mock.calls).toEqual([
    ['botframework-webchat: Cannot update livestreaming session a-1 because it has been concluded']
  ]);
  expect(store.getState().activities.map(({ id }) => id)).toEqual(['a-2']);

  warn.mockRestore();
});

test('a `Date` timestamp warns only when no numeric sequence ID orders the activity', () => {
  const { store } = createStoreWithClock(1_000);
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const timestamp = new Date(1); // A `Date` object, not a time from the clock.

  try {
    // Ordered by its sequence ID: the timestamp is not read.
    store.dispatch(incomingActivity({ ...ACTIVITY, channelData: { 'webchat:sequence-id': 1 }, id: 'a-1', timestamp }));

    expect(warn).not.toHaveBeenCalled();

    store.dispatch(incomingActivity({ ...ACTIVITY, id: 'a-2', timestamp }));

    expect(warn.mock.calls).toEqual([['botframework-webchat: "timestamp" must be of type string, instead of Date.']]);
  } finally {
    warn.mockRestore();
  }
});

test.each([undefined, null])('dispatch(%p) throws the error of Redux', action => {
  const { store } = createStoreWithClock(1_000);

  expect(() => store.dispatch(action as any)).toThrow(/^Actions must be plain objects/u);
});

test('the reducer gives the same state when called twice with the same prepared action', () => {
  // What React's Strict Mode does to the reducer of `useReducer()`.
  const state = reducer(undefined, { type: 'INIT' } as any);
  const action = { ...incomingActivity(ACTIVITY), meta: { fallbackId: 'a-1', localId: '_:l-1', now: 3_000 } } as any;

  expect(reducer(state, action)).toEqual(reducer(state, action));
});

test('an action that was not prepared throws when it reaches the reducer', () => {
  const state = reducer(undefined, { type: 'INIT' } as any);

  expect(() => reducer(state, incomingActivity(ACTIVITY) as any)).toThrow(
    'botframework-webchat: action "DIRECT_LINE/INCOMING_ACTIVITY" reached the reducer without being prepared; dispatch it through the store'
  );
});

test.each([
  ['a missing `now`', { fallbackId: 'a-1', localId: '_:l-1' }],
  ['an undefined `now`', { fallbackId: 'a-1', localId: '_:l-1', now: undefined }],
  ['a string `now`', { fallbackId: 'a-1', localId: '_:l-1', now: '3000' }],
  ['a numeric `fallbackId`', { fallbackId: 1, localId: '_:l-1', now: 3_000 }],
  ['a `localId` that is not an identifier', { fallbackId: 'a-1', localId: 'l 1', now: 3_000 }]
])('an action with %s in its meta throws when it reaches the reducer', (_, meta) => {
  const state = reducer(undefined, { type: 'INIT' } as any);

  expect(() => reducer(state, { ...incomingActivity(ACTIVITY), meta } as any)).toThrow(
    'botframework-webchat: action "DIRECT_LINE/INCOMING_ACTIVITY" reached the reducer without being prepared; dispatch it through the store'
  );
});
