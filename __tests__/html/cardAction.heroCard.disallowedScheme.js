/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('"openUrl" action on hero card', () => {
  test('with a disallowed scheme should not open', () => runHTML('cardAction.heroCard.disallowedScheme.html'));
});
