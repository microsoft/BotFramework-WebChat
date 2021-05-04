/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useScrollToEnd.hideNewMessagesButton', () => {
  test('should scroll to end and hide "New Messages" button', () =>
    runHTML('hooks.useScrollToEnd.hideNewMessagesButton.html'));
});
