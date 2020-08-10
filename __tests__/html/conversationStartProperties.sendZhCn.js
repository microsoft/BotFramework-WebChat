/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('conversationStartProperties', () => {
  test('with locale of zh-CN should get "Hello and welcome!" in Simplified Chinese.', () =>
    runHTMLTest('conversationStartProperties.sendZhCn.html'));
});
