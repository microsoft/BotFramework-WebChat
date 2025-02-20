/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('markdownRenderHTML when unset', () => {
  test('should render sanitized HTML in Adaptive Cards', () => runHTML('markdownRenderHTML/default.adaptiveCards'));
});
