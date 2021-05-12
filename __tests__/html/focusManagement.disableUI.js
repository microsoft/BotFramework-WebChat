/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('focus management', () => {
  test('focus should not move after the whole UI is disabled', () => runHTML('focusManagement.disableUI.html'));
});
