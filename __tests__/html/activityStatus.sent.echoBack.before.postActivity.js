/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity status', () => {
  test('should show "Sending" then "Just now" when echo back is received before return of postActivity() call', () =>
    runHTML('activityStatus.sent.echoBack.before.postActivity.html'));
});
