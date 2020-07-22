/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('simple', () => {
  test('should get "Hello and welcome!" in Simplified Chinese.', () => runHTMLTest('simple.sendZhCn.html'));
});
