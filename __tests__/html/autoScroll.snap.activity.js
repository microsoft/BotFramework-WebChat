/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Auto-scroll with "activity" snap behavior', () => {
  test('should scroll correctly', () => runHTML('autoScroll.snap.activity.html'));
});
