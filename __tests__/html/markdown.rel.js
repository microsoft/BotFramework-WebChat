/**
 * @jest-environment ./__tests__/html/__jest__/perTest/WebChatEnvironment.js
 */

describe('Markdown', () => {
  test('must have rel="noopener noreferrer"', () => runHTMLTest('markdown.rel.html'));
});
