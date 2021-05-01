/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('useScrollUp and useScrollDown hook', () => {
  test('should scroll', () => runHTML('hooks.useScrollUpDown.html'));
});
