/**
 * @jest-environment ./__tests__/html/__jest__/perTest/WebChatEnvironment.js
 */

describe('focus management', () => {
  test('after receive hero card, click on new message button should focus on button', () =>
    runHTMLTest('focusManagement.newMessageButton.receiveHeroCard.html'));
});
