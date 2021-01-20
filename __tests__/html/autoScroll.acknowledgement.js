/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('Auto-scroll acknowledgement logic', () => {
  test('should acknowledge activities correctly', () => runHTMLTest('autoScroll.acknowledgement.html'));
});
