/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('originator', () => {
  test('should display', () => runHTML('originator/basic.html'));
});
