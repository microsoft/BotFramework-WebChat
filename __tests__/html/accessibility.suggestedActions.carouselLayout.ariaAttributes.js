/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  describe('suggested actions of carousel layout', () => {
    test('should have correct ARIA attributes', () => runHTML('accessibility.suggestedActions.carouselLayout.ariaAttributes.html'));
  });
});
