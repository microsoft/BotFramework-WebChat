/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useScrollTo.keepNewMessagesButton', () => {
  test('should scroll and keep "New Messages" button', () =>
    runHTML('hooks.useScrollTo.keepNewMessagesButton.html'));
});
