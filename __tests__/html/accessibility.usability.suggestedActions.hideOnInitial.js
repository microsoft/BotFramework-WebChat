/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility usability', () => {
  test('should not render suggested actions container at initial', () =>
    runHTML('accessibility.usability.suggestedActions.hideOnInitial.html'));
});
