/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('should delay activity with "replyToId" referencing a missing activity', () =>
    runHTML('accessibility.delayActivity.withReplyToId.html'));
});
