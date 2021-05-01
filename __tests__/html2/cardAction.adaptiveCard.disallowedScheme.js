/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('"openUrl" action on Adaptive Card', () => {
  test('with a disallowed scheme should not open', () => runHTML('cardAction.adaptiveCard.disallowedScheme.html'));
});
