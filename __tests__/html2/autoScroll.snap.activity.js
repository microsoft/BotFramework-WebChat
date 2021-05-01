/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('Auto-scroll with "activity" snap behavior', () => {
  test('should scroll correctly', () => runHTML('autoScroll.snap.activity.html'));
});
