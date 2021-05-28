/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('should not run renderMarkdown in excess', () =>
    runHTML('accessibility.liveRegionActivity.performance.html'));
});
