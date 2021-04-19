/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('carousel navigation', () => {
  describe('should focus on card button when present', () => {
    test('carousel', () => runHTMLTest('carousel.navigation.tab.cardInput.html'));
  });
});
