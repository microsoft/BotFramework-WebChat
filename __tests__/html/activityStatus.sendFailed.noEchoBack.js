/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity status', () => {
  test('should show "Send failed" when no echo back is received', () =>
    runHTML('activityStatus.sendFailed.noEchoBack.html'));
});
