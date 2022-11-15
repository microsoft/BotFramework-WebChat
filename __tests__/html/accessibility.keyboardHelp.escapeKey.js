/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('keyboard help screen', () => {
  test('should close when ESCAPE key is pressed', () =>
    runHTML('accessibility.keyboardHelp.escapeKey'));
});
