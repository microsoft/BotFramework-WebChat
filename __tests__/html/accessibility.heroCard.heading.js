/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement for hero card', () => {
  test('should have title text with role="heading"', () =>
    runHTML('accessibility.heroCard.heading'));
});
