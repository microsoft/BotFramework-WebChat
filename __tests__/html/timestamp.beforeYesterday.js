/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('timestamp', () => {
  test('showing date before yesterday', () => runHTML('timestamp.beforeYesterday.html'));
});
