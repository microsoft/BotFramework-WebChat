/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should save last focused activity', () => runHTML('transcript.navigation.focusActivity.saveFocus'));
});
