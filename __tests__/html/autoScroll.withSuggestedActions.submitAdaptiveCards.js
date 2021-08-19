/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Auto-scroll with suggested actions shown', () => {
  test('should stick to bottom if submitting an Adaptive Card', () =>
    runHTML('autoScroll.withSuggestedActions.submitAdaptiveCards.html'));
});
