/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useSendMessage hook', () => {
  test('should send attachments with a message', () => runHTML('sendAttachmentOn/useSendMessage.withMessage'));
});
