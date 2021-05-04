/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should show visual keyboard indicators', () => runHTML('transcript.navigation.visualKeyboardIndicator'));
});
