/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('Adaptive Card with tap action should be focusable', () =>
    runHTML('accessibility.adaptiveCard.withTapAction.html'));
});
