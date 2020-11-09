/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('deprecated <Localize>', () => {
  test('should localize text in navigator language', () => runHTMLTest('deprecated.localize.html'));
  test('should localize text in "en"', () => runHTMLTest('deprecated.localize.html#l=en'));
  test('should localize text in "yue"', () => runHTMLTest('deprecated.localize.html#l=yue'));
});
