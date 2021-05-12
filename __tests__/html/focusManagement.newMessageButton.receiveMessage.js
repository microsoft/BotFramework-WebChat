/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('focus management', () => {
  test('after receive text message, click on new message button should focus on send box', () =>
    runHTML('focusManagement.newMessageButton.receiveMessage.html'));
});
