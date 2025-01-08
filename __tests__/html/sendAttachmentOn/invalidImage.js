/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useSendMessage hook', () => {
  test('should send zip file as image', () => runHTML('sendAttachmentOn/invalidImage'));
});
