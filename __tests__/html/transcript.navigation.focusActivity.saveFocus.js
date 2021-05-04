/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should save last focused activity', () => runHTML('transcript.navigation.focusActivity.saveFocus'));
});
