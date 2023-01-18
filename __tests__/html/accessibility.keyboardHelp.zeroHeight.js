/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('keyboard help screen with zero height', () => {
  test('should not be visible', () =>
    runHTML('accessibility.keyboardHelp.zeroHeight'));
});
