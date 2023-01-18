/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('keyboard help screen', () => {
  test('should show with dark theme', () =>
    runHTML('accessibility.keyboardHelp.darkTheme'));
});
