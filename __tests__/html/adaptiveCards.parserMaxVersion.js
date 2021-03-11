/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('Adaptive Cards', () => {
  test('with "adaptiveCardsParserMaxVersion" style options', () =>
    runHTMLTest('adaptiveCards.parserMaxVersion.html'));
});
