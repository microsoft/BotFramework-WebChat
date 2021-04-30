/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should focus activity by click', () => runHTML('transcript.navigation.focusActivity.byClick'));
});
