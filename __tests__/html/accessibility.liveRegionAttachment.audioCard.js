/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('accessibility requirement', () => {
  describe('attachments in live region', () => {
    test('audio card', () => runHTMLTest('accessibility.liveRegionAttachment.audioCard.html'));
  });
});
