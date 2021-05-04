/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('"Adaptive card', () => {
  test('schema 1.3', () => runHTML('cardAction.adaptiveCard.cardAgendaTranscript.html'));
});
