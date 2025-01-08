/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('markdownRenderHTML when set to false', () => {
  test('should not render HTML in message activity', () => runHTML('markdownRenderHTML/false.messageActivity'));
});
