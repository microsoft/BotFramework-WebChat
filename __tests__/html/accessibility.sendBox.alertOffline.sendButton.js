/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  describe('when clicking on send button while offline', () =>
    test('should alert about offline', () => runHTML('accessibility.sendBox.alertOffline.sendButton.html')));
});
