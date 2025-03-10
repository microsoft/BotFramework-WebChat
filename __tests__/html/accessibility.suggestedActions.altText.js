/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('should support "imageAltText" for images in suggested actions', () =>
    runHTML('accessibility.suggestedActions.altText.html'));
});
