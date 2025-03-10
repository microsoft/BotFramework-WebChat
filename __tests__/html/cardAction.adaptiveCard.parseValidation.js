/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('"Adaptive card', () => {
  test('parsing error', () => runHTML('cardAction.adaptiveCard.parseValidation.html'));
});
