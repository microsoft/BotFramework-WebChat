/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('should not inject "aria-labelledby" for activities without text content in stacked layout', () =>
    runHTML('accessibility.stackedLayout.withoutText.html'));
});
