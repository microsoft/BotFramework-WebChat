/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('focus management', () => {
  test('focus should not move after hero card is disable after obsolete', () =>
    runHTMLTest('focusManagement.disableHeroCard.obsolete.html'));
});
