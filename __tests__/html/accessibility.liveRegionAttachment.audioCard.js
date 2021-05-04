/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  describe('attachments in live region', () => {
    test('audio card', () => runHTML('accessibility.liveRegionAttachment.audioCard.html'));
  });
});
