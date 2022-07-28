/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity status', () => {
  test('should show "Sending" then "Just now" when echo back is received after return of postActivity() call', () =>
    runHTML('activityStatus.sent.echoBack.after.postActivity.html'));
});
