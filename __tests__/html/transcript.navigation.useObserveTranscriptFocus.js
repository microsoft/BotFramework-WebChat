/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation using useObserveTranscriptFocus hook', () => {
  test('should observe transcript focus', () =>
    runHTML('transcript.navigation.useObserveTranscriptFocus'));
});
