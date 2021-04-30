/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('Auto-scroll with "activity" snap behavior', () => {
  test('should scroll correctly', () => runHTMLTest('autoScroll.snap.activity.html'));
});
