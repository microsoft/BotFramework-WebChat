/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('timestamp', () => {
  test('showing date before yesterday', () => runHTML('timestamp.beforeYesterday.html'));
});
