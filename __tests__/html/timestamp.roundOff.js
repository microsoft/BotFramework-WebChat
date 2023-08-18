/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('timestamp', () => {
  test('should round off correctly', () => runHTML('timestamp.roundOff.html'));
});
