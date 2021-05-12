/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('Adaptive Card without tap action should not be focusable', () =>
    runHTML('accessibility.adaptiveCard.withoutTapAction.html'));
});
