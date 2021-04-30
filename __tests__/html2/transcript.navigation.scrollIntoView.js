/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should scroll focused activity into view', () => runHTML('transcript.navigation.scrollIntoView'));
});
