/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('markdownRenderHTML when set to false', () => {
  test('should not render HTML in citation modal', () => runHTML('markdownRenderHTML/false.citationModal'));
});
