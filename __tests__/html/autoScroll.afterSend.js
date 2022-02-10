/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Auto-scroll', () => {
  test('should scroll to bottom on send', () => runHTML('autoScroll.afterSend.html'));
});
