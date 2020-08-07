/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('conversationStartProperties', () => {
  test('with non ISO format locale should get "Hello and welcome!" message.', () =>
    runHTMLTest('conversationStartProperties.sendNonISOFormat.html'));
});
