/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Call useSendFiles hook with a file with extension of .ZIP but type of "image/jpeg"', () => {
  test('should not display thumbnail', () => runHTML('sendAttachmentOn/useSendFiles.binary'));
});
