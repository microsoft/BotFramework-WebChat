/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('keyboard help screen with reduced height', () => {
  test('should show a scrollbar', () =>
    runHTML('accessibility.keyboardHelp.reducedHeight'));
});
