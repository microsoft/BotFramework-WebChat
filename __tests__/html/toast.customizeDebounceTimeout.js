/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('notification toast', () => {
  test('customize toast debounce time on update and dismiss', () => runHTML('toast.customizeDebounceTimeout.html'));
});
