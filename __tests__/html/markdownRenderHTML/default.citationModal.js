/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('markdownRenderHTML when unset', () => {
  test('should render sanitized HTML in citation modal', () => runHTML('markdownRenderHTML/default.citationModal'));
});
