/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('"Adaptive card', () => {
  test('schema 1.3', () => runHTML('cardAction.adaptiveCard.cardAgendaTranscript.html'));
});
