/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('"Adaptive card', () => {
  test('card agenda with schema 1.3 should pass', () => runHTML('cardAction.adaptiveCard.cardAgenda.html'));
});
