/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('suggested actions', () => {
  test('should be focusable using access key.', () => runHTML('suggestedActions.accessKey.html'));
});
