/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('conversationStartProperties', () => {
  test('with no locale is sent should get "Hello and welcome!" message.', () =>
    runHTMLTest('conversationStartProperties.noLocaleIsSent.html'));
});
