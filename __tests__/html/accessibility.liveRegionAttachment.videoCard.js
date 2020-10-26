/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('accessibility requirement', () => {
  describe('attachments in live region', () => {
    test('video card', () => runHTMLTest('accessibility.liveRegionAttachment.videoCard.html'));
  });
});
