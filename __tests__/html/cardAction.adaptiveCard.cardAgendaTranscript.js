/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('"Adaptive card', () => {
  test('schema 1.3', () =>
    runHTMLTest('cardAction.adaptiveCard.cardAgendaTranscript.html', { ignoreConsoleError: true }));
});
