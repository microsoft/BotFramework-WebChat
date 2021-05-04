/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useTextBox', () => {
  test('should work properly', () => runHTML('hooks.useTextBox.html'));
});
