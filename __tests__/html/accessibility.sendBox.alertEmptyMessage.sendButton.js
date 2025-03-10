/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  describe('when clicking on send box with an empty send box', () =>
    test('should alert about empty message', () => runHTML('accessibility.sendBox.alertEmptyMessage.sendButton.html')));
});
