/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should back up when ESCAPE key is pressed', () => runHTML('transcript.navigation.escapeKey'));
});
