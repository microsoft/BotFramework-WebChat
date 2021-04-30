/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation using useObserveTranscriptFocus hook', () => {
  test('should observe transcript focus', () =>
    runHTML('transcript.navigation.useObserveTranscriptFocus'));
});
