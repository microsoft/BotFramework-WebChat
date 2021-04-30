/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  describe('attachments in live region', () => {
    test('receipt card', () => runHTML('accessibility.liveRegionAttachment.receiptCard.html', { height: 1280 }));
  });
});
