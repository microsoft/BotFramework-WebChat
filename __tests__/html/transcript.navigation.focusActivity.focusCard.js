/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should focus activity and focus on card', () => runHTML('transcript.navigation.focusActivity.focusCard'));
});
