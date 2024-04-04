/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('with "sendAttachmentOn" of "send"', () => {
  test('should send attachments when the send button is clicked', () => runHTML('sendAttachmentOn/onSend'));
});
