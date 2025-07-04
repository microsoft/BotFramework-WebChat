/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('when styleOptions.disableFileUpload is truthy should not render attach file button or file upload drop zone', () => runHTML('fluentTheme/hideAttachFileButtonAndDisableDropZone'));
});
