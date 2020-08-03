/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('accessibility requirement', () => {
  test('should support "imageAltText" for images in suggested actions', () =>
    runHTMLTest('accessibility.suggestedActions.altText.html'));
});
