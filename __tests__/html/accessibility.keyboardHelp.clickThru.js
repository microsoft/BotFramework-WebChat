/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('keyboard help screen', () => {
  test('should not interfere when clicking on activities', () =>
    runHTML('accessibility.keyboardHelp.clickThru'));
});
