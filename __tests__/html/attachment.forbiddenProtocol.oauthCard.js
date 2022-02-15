/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('OAuth card', () => {
  test('with "contentUrl" of forbidden protocols', () =>
    runHTML('attachment.forbiddenProtocol.oauthCard.html'));
});
