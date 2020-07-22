/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('simple', () => {
  test('should get "Hello and welcome!" message.', () => runHTMLTest('simple.sendEnUs.html'));
});
