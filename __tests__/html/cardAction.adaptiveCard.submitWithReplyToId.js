/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('"Adaptive card', () => {
  test('submit will post activity with replyToId', () => runHTML('cardAction.adaptiveCard.submitWithReplyToId.html'));
});
