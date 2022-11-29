/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('keyboard help screen', () => {
  test('should show the images in high-contrast mode correctly', () =>
    runHTML('accessibility.keyboardHelp.contrast'));
});
