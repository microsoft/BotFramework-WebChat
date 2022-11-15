/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('keyboard help screen', () => {
  test('should close when TAB away and show when TAB back', () =>
    runHTML('accessibility.keyboardHelp.tabKey'));
});
