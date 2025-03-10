/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards', () => {
  test('with "tapAction" prop should react to click, ENTER, and SPACEBAR', () =>
    runHTML('adaptiveCards.tapAction.html'));
});
