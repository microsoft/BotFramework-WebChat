/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('"Adaptive card', () => {
  test('card agenda with schema 1.3 should pass', () => runHTMLTest('cardAction.adaptiveCard.cardAgenda.html'));
});
