/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should focus activity by click', () => runHTML('transcript.navigation.focusActivity.byClick'));
});
