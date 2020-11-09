/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('accessibility requirement', () => {
  describe('attachments in live region', () => {
    test('receipt card', () => runHTMLTest('accessibility.liveRegionAttachment.receiptCard.html', { height: 1280 }));
  });
});
