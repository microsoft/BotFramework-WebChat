/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('"openUrl" action on hero card', () => {
  test('should open URL in a new tab with "noopener" and "noreferrer"', () =>
    runHTML('cardAction.heroCard.openURL.html'));
});
