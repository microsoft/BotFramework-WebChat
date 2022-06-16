/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('localization strings', () => {
  test('should be customizable.', () =>
    runHTML('localization.customization.html'));
});
