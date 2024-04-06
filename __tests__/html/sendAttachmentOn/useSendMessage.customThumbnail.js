/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useSendMessage hook', () => {
  test('should send attachments with a custom thumbnail', () =>
    runHTML('sendAttachmentOn/useSendMessage.customThumbnail'));
});
