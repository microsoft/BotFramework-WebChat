/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Auto-scroll with "default" snap behavior', () => {
  test('should scroll correctly', () => runHTML('autoScroll.snap.default.html'));
});
