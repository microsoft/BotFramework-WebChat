/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards', () => {
  test('with "adaptiveCardsParserMaxVersion" style options', () =>
    runHTML('adaptiveCards.parserMaxVersion.html'));
});
