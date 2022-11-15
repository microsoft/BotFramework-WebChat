/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('keyboard help screen', () => {
  test('should close when the close button is clicked', () =>
    runHTML('accessibility.keyboardHelp.clickCloseButton'));
});
