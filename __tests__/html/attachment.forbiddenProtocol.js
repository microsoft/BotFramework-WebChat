/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Attachment', () => {
  test('with "contentUrl" of forbidden protocols', () =>
    runHTML('attachment.forbiddenProtocol.html'));
});
