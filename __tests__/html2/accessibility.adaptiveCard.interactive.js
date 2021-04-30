/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('interactive Adaptive Card should be focusable', () =>
    runHTML('accessibility.adaptiveCard.interactive.html'));
});
