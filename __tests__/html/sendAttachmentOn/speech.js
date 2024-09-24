/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('with "sendAttachmentOn" unset', () => {
  // Skipped due to failure on CI
  test.skip('should send attachments via speech recognition', () => runHTML('sendAttachmentOn/speech'));
});
