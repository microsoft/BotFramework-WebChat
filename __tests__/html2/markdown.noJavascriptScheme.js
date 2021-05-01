/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('Markdown', () => {
  test('should not render URL with "javascript" scheme', () => runHTML('markdown.noJavaScriptScheme.html'));
});
