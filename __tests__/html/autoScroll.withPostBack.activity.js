/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Auto-scroll with "activity" snap behavior', () => {
  test('should not pause on post back activity', () => runHTML('autoScroll.withPostBack.activity.html'));
});
