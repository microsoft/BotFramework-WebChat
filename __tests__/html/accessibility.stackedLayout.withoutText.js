/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('accessibility requirement', () => {
  test('should not inject "aria-labelledby" for activities without text content in stacked layout', () =>
    runHTMLTest('accessibility.stackedLayout.withoutText.html'));
});
