/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('simple', () => {
  test('should support "locale" prop.', () => runHTMLTest('simple.localeSupport.html'));
});
