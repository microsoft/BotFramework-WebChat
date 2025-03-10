/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should scroll into view based on input', () => runHTML('transcript.navigation.focusActivity.scrollIntoView.assumptions'));
});
