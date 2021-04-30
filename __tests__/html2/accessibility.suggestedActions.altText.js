/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('should support "imageAltText" for images in suggested actions', () =>
    runHTML('accessibility.suggestedActions.altText.html'));
});
