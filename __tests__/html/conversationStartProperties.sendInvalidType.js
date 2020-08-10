/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('conversationStartProperties', () => {
  test('with locale of invalid type should get "Hello and welcome!" message.', () =>
    runHTMLTest('conversationStartProperties.sendInvalidType.html'));
});
