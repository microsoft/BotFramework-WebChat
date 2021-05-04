/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('should delay activity with "replyToId" referencing a missing activity', () =>
    runHTML('accessibility.delayActivity.withReplyToId.html'));
});
