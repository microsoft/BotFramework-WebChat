/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('activity should not be delayed due to user typing activity', () =>
    runHTML('accessibility.delayActivity.typingActivity.html'));
});
