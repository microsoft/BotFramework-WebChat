/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Auto-scroll with "activity" snap behavior', () => {
  test('should not pause on invisible activity', () => runHTML('autoScroll.eventActivity.html'));
});
