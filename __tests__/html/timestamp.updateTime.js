/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('timestamp', () => {
  test('should change after time', () => runHTML('timestamp.updateTime.html'));
});
