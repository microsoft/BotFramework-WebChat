/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('Auto-scroll with "page" snap behavior', () => {
  test('should scroll correctly', () => runHTMLTest('autoScroll.snap.page.html'));
});
