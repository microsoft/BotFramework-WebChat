/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity status', () => {
  test('should show "Send failed" when postActivity did not return any values', () =>
    runHTML('activityStatus.sendFailed.postActivity.noReturnValue.html'));
});
