/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('disabling Adaptive Card with "Action.ShowCard"', () =>
    runHTML('accessibility.adaptiveCard.disabled.focus.withShowCard.html'));
});
