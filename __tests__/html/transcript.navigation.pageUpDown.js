/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should scroll page up and down on keys', () => runHTML('transcript.navigation.pageUpDown'));
});
