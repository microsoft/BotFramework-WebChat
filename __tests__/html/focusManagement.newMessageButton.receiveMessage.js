/**
 * @jest-environment ./__tests__/html/__jest__/perTest/WebChatEnvironment.js
 */

describe('focus management', () => {
  test('after receive text message, click on new message button should focus on send box', () =>
    runHTMLTest('focusManagement.newMessageButton.receiveMessage.html'));
});
