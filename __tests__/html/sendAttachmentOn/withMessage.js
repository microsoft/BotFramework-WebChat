/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('with "sendAttachmentOn" unset', () => {
  test('should send attachments with a message', () => runHTML('sendAttachmentOn/withMessage'));
});
