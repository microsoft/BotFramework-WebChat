/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('non-interactive Adaptive Card should not be focusable', () =>
    runHTML('accessibility.adaptiveCard.nonInteractive.html'));
});
