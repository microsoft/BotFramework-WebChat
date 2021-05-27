/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('should clean up "speak" property for live region text', () =>
    runHTML('accessibility.liveRegionActivity.text.html'));
});
