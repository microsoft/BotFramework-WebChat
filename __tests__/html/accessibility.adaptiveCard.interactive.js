/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('accessibility requirement', () => {
  test('interactive Adaptive Card should be focusable', () =>
    runHTMLTest('accessibility.adaptiveCard.interactive.html'));
});
