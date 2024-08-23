/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  describe('accessibility requirement', () => {
    describe('when pressing ENTER on an empty multiline send box', () =>
      test('should alert about empty message', () =>
        runHTML('fluentTheme/accessibility.sendBox.alertEmptyMessage.multilineTextBox.enter.html')));
  });
});
