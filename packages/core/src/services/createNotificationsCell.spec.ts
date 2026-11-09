/**
 * @jest-environment @happy-dom/jest-environment
 */
/* eslint-disable no-restricted-globals */
import dismissNotification from '../actions/dismissNotification';
import sagaError from '../actions/sagaError';
import setNotification from '../actions/setNotification';
import createNotificationsReducer from '../reducers/createNotificationsReducer';
import createNotificationsCell from './createNotificationsCell';

function createClock() {
  let now = 0;

  return { Date: { now: () => now } as unknown as DateConstructor, tick: (ms: number) => (now += ms) };
}

// The same operations on the reducer and on the cell, as `setNotification()` and `dismissNotification()` do in each mode.
const OPERATIONS: readonly [string, (target: { dismiss; markJavaScriptError; set }) => void][] = [
  ['set "a"', ({ set }) => set({ alt: 'A', id: 'a', level: 'info', message: 'hello' })],
  ['set "a" again, same values', ({ set }) => set({ alt: 'A', id: 'a', level: 'info', message: 'hello' })],
  ['set "a", new message', ({ set }) => set({ alt: 'A', id: 'a', level: 'info', message: 'world' })],
  ['set "a", new level', ({ set }) => set({ alt: 'A', id: 'a', level: 'error', message: 'world' })],
  ['set "a", new data', ({ set }) => set({ alt: 'A', data: { x: 1 }, id: 'a', level: 'error', message: 'world' })],
  ['set "b"', ({ set }) => set({ alt: 'B', id: 'b', level: 'warn', message: 'b' })],
  ['set "__proto__" (forbidden)', ({ set }) => set({ alt: 'P', id: '__proto__', level: 'info', message: 'x' })],
  ['set without a level', ({ set }) => set({ alt: 'C', id: 'c', level: undefined, message: 'c' })],
  ['dismiss "b"', ({ dismiss }) => dismiss('b')],
  ['dismiss "missing"', ({ dismiss }) => dismiss('missing')],
  ['saga error, no "connectivitystatus" yet', ({ markJavaScriptError }) => markJavaScriptError()],
  [
    'set "connectivitystatus"',
    ({ set }) => set({ alt: undefined, id: 'connectivitystatus', level: 'success', message: 'connected' })
  ],
  ['saga error', ({ markJavaScriptError }) => markJavaScriptError()]
];

test('the cell keeps the notifications as the reducer does, and notifies only on changes', () => {
  const reducerClock = createClock();
  const cellClock = createClock();
  const reducer = createNotificationsReducer({ Date: reducerClock.Date } as any);
  const cell = createNotificationsCell({ ponyfill: { Date: cellClock.Date } });
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

  let reducerState = reducer(undefined, { type: '@@INIT' } as any);
  let notified = 0;

  cell.notifications.subscribe(() => notified++);

  try {
    for (const [label, operation] of OPERATIONS) {
      const before = { cell: cell.notifications.get(), notified, reducer: reducerState };

      reducerClock.tick(1_000);
      cellClock.tick(1_000);

      operation({
        dismiss: id => (reducerState = reducer(reducerState, dismissNotification(id))),
        markJavaScriptError: () => (reducerState = reducer(reducerState, sagaError())),
        set: notification => (reducerState = reducer(reducerState, setNotification(notification)))
      });

      operation({
        dismiss: cell.dismissNotification,
        markJavaScriptError: cell.markJavaScriptError,
        set: cell.setNotification
      });

      expect([label, cell.notifications.get()]).toEqual([label, reducerState]);
      // One notification per change, none without.
      expect([label, notified - before.notified]).toEqual([label, reducerState === before.reducer ? 0 : 1]);
      expect([label, cell.notifications.get() === before.cell]).toEqual([label, reducerState === before.reducer]);
    }

    // The action creator and the cell warned the same, once each.
    expect(warn.mock.calls).toEqual([
      [expect.stringContaining('"level" argument')],
      [expect.stringContaining('"level" argument')]
    ]);
  } finally {
    warn.mockRestore();
  }
});

test('the timestamp comes from the ponyfill, when the notification changes', () => {
  const clock = createClock();
  const cell = createNotificationsCell({ ponyfill: { Date: clock.Date } });

  clock.tick(123);
  cell.setNotification({ alt: undefined, id: 'a', level: 'info', message: 'x' });
  clock.tick(1);
  cell.setNotification({ alt: undefined, id: 'a', level: 'info', message: 'x' });

  expect(cell.notifications.get()).toEqual({
    a: { alt: undefined, data: undefined, id: 'a', level: 'info', message: 'x', timestamp: 123 }
  });
});

test('notifies through notify()', () => {
  const notify = jest.fn(callListeners => callListeners());
  const cell = createNotificationsCell({ notify, ponyfill: { Date } });
  const listener = jest.fn();

  cell.notifications.subscribe(listener);
  cell.setNotification({ alt: undefined, id: 'a', level: 'info', message: 'x' });

  expect(notify).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledTimes(1);
});
