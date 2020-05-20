/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('focus management', () => {
  test('focus should not move after Adaptive Card is disable after obsolete', () =>
    runHTMLTest('focusManagement.disableAdaptiveCard.obsolete.html'));
});
