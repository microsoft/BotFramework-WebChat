/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('suggested actions with access key disabled', () => {
  test('should not have screen reader text related to access key.', () => runHTML('suggestedActions.noAccessKey.html'));
});
