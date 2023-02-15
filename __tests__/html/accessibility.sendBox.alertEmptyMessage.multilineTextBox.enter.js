/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  describe('when pressing ENTER on an empty multiline send box', () =>
    test('should alert about empty message', () => runHTML('accessibility.sendBox.alertEmptyMessage.multilineTextBox.enter.html')));
});
