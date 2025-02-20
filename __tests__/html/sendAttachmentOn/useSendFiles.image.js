/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Call useSendFiles hook with a file with extension of .JPG but type of "application/octet-stream"', () => {
  test('should display thumbnail', () => runHTML('sendAttachmentOn/useSendFiles.image'));
});
