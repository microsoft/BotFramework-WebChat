/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('with "sendAttachmentOn" of "attach"', () => {
  test('should send attachments when the file is attached', () => runHTML('sendAttachmentOn/onAttach'));
});
