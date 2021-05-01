/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards', () => {
  test('with "tapAction" prop should react to click, ENTER, and SPACEBAR', () =>
    runHTML('adaptiveCards.tapAction.html'));
});
