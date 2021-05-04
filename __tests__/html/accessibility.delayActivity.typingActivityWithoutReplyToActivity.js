/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('activity should be delayed due to non-existing activity', () =>
    runHTML('accessibility.delayActivity.typingActivityWithoutReplyToActivity.html'));
});
