/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation proactive message behavior', () => {
  test('should focus on last activity when focus is on send box', () =>
    runHTML('transcript.navigation.behavior.proactive.message'));
});
