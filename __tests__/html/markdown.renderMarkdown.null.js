/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Markdown', () => {
  test('should not render when renderMarkdown is null', () => runHTML('markdown.renderMarkdown.null.html'));
});
