/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('useFocus', () => {
  test('on main', () => runHTML('useFocus.main.html'));
});
