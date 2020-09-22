/**
 * @jest-environment ./__tests__/html/__jest__/perTest/WebChatEnvironment.js
 */

describe('accessibility requirement', () => {
  test('non-interactive Adaptive Card should not be focusable', () =>
    runHTMLTest('accessibility.adaptiveCard.nonInteractive.html'));
});
