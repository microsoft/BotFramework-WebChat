/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should focus the last activity when press up arrow key on the terminator', () =>
    runHTML('transcript.navigation.upArrowOnTerminator'));
});
