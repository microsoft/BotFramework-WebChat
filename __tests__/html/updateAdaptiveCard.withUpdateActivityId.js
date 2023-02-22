/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('"Adaptive card', () => {
  test('the first card should coverd by the second card', () =>
    runHTML('updateAdaptiveCard.withUpdateActivityId.html'));
});
