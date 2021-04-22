/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('accessibility requirement', () => {
  test('Element with aria-label should not have parent aria-hidden', () =>
    runHTMLTest('accessibility.attachment.aria'));
});
