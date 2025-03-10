/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

// Verify compliance of https://github.com/microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#speak.
describe('accessibility requirement', () => {
  test('should clean up "speak" property for live region text', () =>
    runHTML('accessibility.liveRegionActivity.text.html'));
});
