/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('keyboard help screen', () => {
  test('should have a label', () => runHTML('accessibility.keyboardHelp.ariaLabel'));
});
