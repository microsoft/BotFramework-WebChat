import incomingActivity from '../actions/incomingActivity';
import setNotification from '../actions/setNotification';
import { withOptions } from '../createStore';
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

test('the reducer gives the same state when called twice with the same prepared action', () => {
  // What React's Strict Mode does to the reducer of `useReducer()`.
  const state = reducer(undefined, { type: 'INIT' } as any);
  const action = { ...incomingActivity(ACTIVITY), meta: { fallbackId: 'a-1', localId: '_:l-1', now: 3_000 } } as any;

  expect(reducer(state, action)).toEqual(reducer(state, action));
});
