/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('middleware to disable obsolete Adaptive Cards', () => {
  test('should NOT disable anchors', () => runHTMLTest('middleware.obsoleteAdaptiveCard.anchor.html'));
});
