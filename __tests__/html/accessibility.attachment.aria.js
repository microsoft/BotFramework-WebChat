/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('Element with aria-label should not have parent aria-hidden', () =>
    runHTML('accessibility.attachment.aria'));
});
