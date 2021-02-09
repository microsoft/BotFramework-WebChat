/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('"Adaptive card', () => {
  test('card agenda should fail', () => runHTMLTest('cardAction.adaptiveCard.cardAgenda.html'));
});
