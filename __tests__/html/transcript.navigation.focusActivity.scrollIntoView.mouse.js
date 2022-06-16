/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should not scroll into view after clicking', () => runHTML('transcript.navigation.focusActivity.scrollIntoView.mouse'));
});
