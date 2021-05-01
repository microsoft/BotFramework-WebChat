/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('suggested actions', () => {
  test('should be focusable using access key.', () => runHTML('suggestedActions.accessKey.html'));
});
