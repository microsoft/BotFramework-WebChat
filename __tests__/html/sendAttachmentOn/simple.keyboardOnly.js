/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('with "sendAttachmentOn" unset and use keyboard for the flow', () => {
  test('should send attachments when the send button is clicked', () => runHTML('sendAttachmentOn/simple.keyboardOnly'));
});
