/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Attachment', () => {
  test('with "contentUrl" of allowed protocols', () =>
    runHTML('attachment.allowedProtocol.html'));
});
