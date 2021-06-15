/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Markdown', () => {
  test('should be disabled when setting "renderMarkdown" to false', () => runHTML('markdown.disableRenderMarkdown.html'));
});
