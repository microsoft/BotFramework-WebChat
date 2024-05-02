/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('markdownRenderHTML', () => {
  test('renders sanitized html in citation modal', () => runHTML('markdownRenderHTML/renderHTML.citation'));
});
