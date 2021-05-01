/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('"Adaptive card', () => {
  test('parsing error', () => runHTML('cardAction.adaptiveCard.parseValidation.html'));
});
