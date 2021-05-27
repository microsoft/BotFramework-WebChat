/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('should comply with "summary" property', () =>
    runHTML('accessibility.liveRegionActivity.summary.html'));
});
