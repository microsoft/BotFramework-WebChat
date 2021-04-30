/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('should not delay activity without "replyToId"', () =>
    runHTML('accessibility.delayActivity.withoutReplyToId.html'));
});
