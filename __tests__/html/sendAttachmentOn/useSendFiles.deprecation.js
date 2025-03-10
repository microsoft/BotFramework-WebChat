/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Call useSendFiles hook', () => {
  test('should print deprecation warning', () => runHTML('sendAttachmentOn/useSendFiles.deprecation'));
});
