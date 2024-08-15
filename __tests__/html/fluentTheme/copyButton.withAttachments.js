/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied with attachments', () => {
  test('copy button should layout properly', () => runHTML('fluentTheme/copyButton.withAttachments'));
});
