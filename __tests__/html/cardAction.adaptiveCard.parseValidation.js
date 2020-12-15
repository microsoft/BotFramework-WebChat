/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('"Adaptive card', () => {
  test('parsing error', () => runHTMLTest('cardAction.adaptiveCard.parseValidation.html'));
});
