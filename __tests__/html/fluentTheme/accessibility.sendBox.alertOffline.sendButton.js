/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  describe('accessibility requirement', () => {
    describe('when clicking on send button while offline', () =>
      test('should alert about offline', () => runHTML('fluentTheme/accessibility.sendBox.alertOffline.sendButton.html')));
  });
});
