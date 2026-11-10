/**
 * @jest-environment <rootDir>/../__tests__/unit.setup/HappyDOMEnvironmentWithTimeZone.js
 * @timezone America/Los_Angeles
 */
// The specs of Redux mode that run on the sagas only, run again here on the machines: core's store (`withOptions()`) and
// the Redux driver of the parity harness use the machines instead. (The golden, parity and connection pinned specs run
// on both engines by themselves.) The time zone is the one the speech pins assert.
import '../__tests__/parity/redux.outgoing.pinned.spec';
import '../__tests__/parity/redux.speech.pinned.spec';
import '../createStore.devTools.spec';
import '../sagas/postActivitySaga.sendTimeout.spec';
import '../sagas/queueIncomingActivitySaga.spec';

jest.mock('../createStore', () => {
  const actual = jest.requireActual('../createStore');

  return {
    ...actual,
    __esModule: true,
    withOptions: (...args: Parameters<typeof actual.withOptions>) => actual.createStoreWithEngine('machines', ...args)
  };
});

jest.mock('../__tests__/parity/createReduxDriver', () => {
  const actual = jest.requireActual('../__tests__/parity/createReduxDriver');

  return { ...actual, __esModule: true, default: actual.createMachinesDriver };
});

test('the store and the Redux driver run on the machines here', () => {
  const { withOptions } = require('../createStore');
  const { createMachinesDriver, default: createReduxDriver } = require('../__tests__/parity/createReduxDriver');

  expect(withOptions).not.toBe(jest.requireActual('../createStore').withOptions);
  expect(createReduxDriver).toBe(createMachinesDriver);
});
