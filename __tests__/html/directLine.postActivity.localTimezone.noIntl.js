/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('postActivity', () => {
  test('should send localTimestamp only if Intl global is undefined', () => runHTML('directLine.postActivity.localTimezone.noIntl.html'));
});
