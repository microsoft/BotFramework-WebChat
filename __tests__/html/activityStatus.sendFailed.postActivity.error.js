/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity status', () => {
  test('should show "Send failed" when postActivity returned an error', () =>
    runHTML('activityStatus.sendFailed.postActivity.error.html'));
});
