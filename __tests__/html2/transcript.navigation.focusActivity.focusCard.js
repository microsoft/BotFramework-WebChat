/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should focus activity and focus on card', () => runHTML('transcript.navigation.focusActivity.focusCard'));
});
