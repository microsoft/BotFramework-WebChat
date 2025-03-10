/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('postActivity', () => {
  test('should send localTimestamp and localTimezone', () => runHTML('directLine.postActivity.localTimezone.html'));
});
