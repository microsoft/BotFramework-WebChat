/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('markdownRenderHTML when unset', () => {
  test('should render sanitized HTML in message activity', () => runHTML('markdownRenderHTML/default.messageActivity'));
});
