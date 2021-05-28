/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

// Verify compliance of https://github.com/microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#speak.
describe('accessibility requirement', () => {
  test('should clean up HTML in Markdown', () =>
    runHTML('accessibility.liveRegionActivity.htmlInMarkdown.html'));
});
