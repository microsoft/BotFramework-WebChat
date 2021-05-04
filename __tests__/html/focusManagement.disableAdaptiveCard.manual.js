/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('focus management', () => {
  test('focus should not move after Adaptive Card is disable after manually disabled', () =>
    runHTML('focusManagement.disableAdaptiveCard.manual.html'));
});
