/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards', () => {
  test('assumes the container is using "forced border-box" mode', () =>
    runHTML('adaptiveCards.assumeBorderBox.html'));
});
