/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('notification toast', () => {
  test('should show privacy policy', () => runHTMLTest('toast.html'));
});
