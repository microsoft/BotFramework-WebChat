/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('useTextBox', () => {
  test('should work properly', () => runHTML('hooks.useTextBox.html'));
});
