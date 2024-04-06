/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Call useSendBoxAttachments hook', () => {
  test('should get/set and upload attachments', () => runHTML('sendAttachmentOn/useSendBoxAttachments'));
});
