/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  describe('attachments in live region', () => {
    test('thumbnail card', () => runHTML('accessibility.liveRegionAttachment.thumbnailCard.html'));
  });
});
