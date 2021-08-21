/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation proactive message behavior', () => {
  test('should keep activity focus when interactive element is focused', () =>
    runHTML('transcript.navigation.behavior.proactive.adaptiveCard'));
});
