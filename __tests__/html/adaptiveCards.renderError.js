/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards', () => {
  test('should not error when render an erroneous card', () => runHTML('adaptiveCards.renderError.html'));
});
