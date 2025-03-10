/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('OAuth card', () => {
  test('with "contentUrl" of allowed protocols', () =>
    runHTML('attachment.allowedProtocol.oauthCard.html'));
});
