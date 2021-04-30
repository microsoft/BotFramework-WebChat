/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should back up when ESCAPE key is pressed', () => runHTML('transcript.navigation.escapeKey'));
});
