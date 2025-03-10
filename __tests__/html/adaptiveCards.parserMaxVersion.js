/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards', () => {
  test('with "adaptiveCardsParserMaxVersion" style options', () =>
    runHTML('adaptiveCards.parserMaxVersion.html'));
});
