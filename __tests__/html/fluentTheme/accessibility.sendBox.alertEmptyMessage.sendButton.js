/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  describe('accessibility requirement', () => {
    describe('when clicking on send box with an empty send box', () =>
      test('should alert about empty message', () => runHTML('fluentTheme/accessibility.sendBox.alertEmptyMessage.sendButton.html')));
  });
});
