/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('Adaptive Card should apply aria-pushed="true" after clicking a button', () =>
    runHTML('accessibility.adaptiveCard.ariaPushed.html'));
});
