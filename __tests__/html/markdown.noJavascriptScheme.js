/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('Markdown', () => {
  test('should not render URL with "javascript" scheme', () => runHTMLTest('markdown.noJavaScriptScheme.html'));
});
