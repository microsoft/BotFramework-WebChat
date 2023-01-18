/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('keyboard help screen with reduced width', () => {
  test('should not clip', () =>
    runHTML('accessibility.keyboardHelp.reducedWidth'));
});
