/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useScrollUp and useScrollDown hook', () => {
  test('should scroll', () => runHTML('hooks.useScrollUpDown.html'));
});
