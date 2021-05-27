/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

// Verify compliance of https://github.com/microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#speak.
describe('accessibility requirement', () => {
  test('when "speak" field present, it should override all attachments', () =>
    runHTML('accessibility.liveRegionActivity.speakOverrideAttachments.html'));
});
