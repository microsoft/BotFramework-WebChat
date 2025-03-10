/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useFocus', () => {
  test('on main', () => runHTML('useFocus.main.html'));
});
