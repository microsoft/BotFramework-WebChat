import { createActivitiesStore } from '@msinternal/botframework-webchat-core-activities';
import { legacy_createStore as createReduxStore } from 'redux';

import registerActionSink from '../actions/registerActionSink';
import createDefaultEngine from './createDefaultEngine';
import createDefaultModeReducers from './createDefaultModeReducers';
import createReducerGroup from './createReducerGroup';

function createEngine() {
  // eslint-disable-next-line no-restricted-globals
  const ponyfill = { Date, clearTimeout, setTimeout } as any;
  const reducers = createDefaultModeReducers(ponyfill);

  return createDefaultEngine({
    activitiesStore: createActivitiesStore({ ponyfill }),
    batch: fn => fn(),
    groups: [createReducerGroup(reducers.connection), createReducerGroup(reducers.sendBox)],
    ponyfill
  });
}

// Values that card action middleware could dispatch.
test.each([
  ['undefined', undefined],
  ['null', null],
  ['a function', () => undefined],
  ['an array', []],
  ['a class instance', new (class Action {})()],
  ['no type', {}],
  ['a number type', { type: 1 }]
])('dispatch() of %s should throw as dispatch() of a Redux store', (_, action) => {
  const reduxStore = createReduxStore(() => ({}));
  let reduxError: unknown;

  try {
    reduxStore.dispatch(action as any);
  } catch (error) {
    reduxError = error;
  }

  expect(reduxError).toBeInstanceOf(Error);
  expect(() => createEngine().dispatch(action)).toThrow((reduxError as Error).message);
});

test('the machines should take actions after start(), none after stop(), and new ones after start() again', async () => {
  const engine = createEngine();
  const sink = jest.fn();
  // eslint-disable-next-line no-restricted-globals
  const flush = () => new Promise(resolve => setTimeout(resolve, 0));

  engine.dispatch(registerActionSink(sink));
  await flush();

  engine.start();
  engine.dispatch(registerActionSink(sink));
  engine.dispatch({ type: 'TEST/ONE' });
  await flush();

  engine.stop();
  engine.dispatch({ type: 'TEST/TWO' });
  await flush();

  engine.start();
  engine.dispatch({ type: 'TEST/THREE' });
  engine.dispatch(registerActionSink(sink));
  engine.dispatch({ type: 'TEST/FOUR' });
  await flush();

  // Each sink gets the actions after its registration, while the machines that registered it run.
  expect(sink.mock.calls.map(([{ type }]) => type)).toEqual(['TEST/ONE', 'TEST/FOUR']);
});
