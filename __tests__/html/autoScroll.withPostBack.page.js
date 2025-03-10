/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Auto-scroll with "page" snap behavior', () => {
  test('should not pause on post back activity', () => runHTML('autoScroll.withPostBack.page.html'));
});
