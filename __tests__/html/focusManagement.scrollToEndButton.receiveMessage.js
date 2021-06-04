/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('focus management', () => {
  test('after receive text message, click on scroll to end button should focus on send box', () =>
    runHTML('focusManagement.scrollToEndButton.receiveMessage.html'));
});
