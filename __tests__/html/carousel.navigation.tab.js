/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('carousel navigation', () => {
  test('should show focus when tabbing inside carousel', () => runHTMLTest('carousel.navigation.tab.html'));
});
