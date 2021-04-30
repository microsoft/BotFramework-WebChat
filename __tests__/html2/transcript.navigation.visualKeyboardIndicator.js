/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should show visual keyboard indicators', () => runHTML('transcript.navigation.visualKeyboardIndicator'));
});
