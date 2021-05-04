/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('should not delay activity without "replyToId"', () =>
    runHTML('accessibility.delayActivity.withoutReplyToId.html'));
});
