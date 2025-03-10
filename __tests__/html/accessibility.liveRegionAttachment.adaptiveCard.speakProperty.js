/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('live region should narrate "speak" property', () => {
  test('Adaptive Card', () => runHTML('accessibility.liveRegionAttachment.adaptiveCard.speakProperty.html'));
});
