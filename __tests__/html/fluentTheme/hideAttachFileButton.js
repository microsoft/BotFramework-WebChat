/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('when styleOptions.hideUploadButton is truthy should not render attach file button', () => runHTML('fluentTheme/hideAttachFileButton'));
});
