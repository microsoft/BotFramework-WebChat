/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should auto-select last activity when SHIFT-TAB into the transcript', () => runHTML('transcript.navigation.defaultActiveDescendant.shiftTab'));
});
