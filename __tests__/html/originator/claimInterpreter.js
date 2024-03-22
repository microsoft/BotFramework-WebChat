/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('originator using claimInterpreter', () => {
  test('should display', () => runHTML('originator/claimInterpreter.html'));
});
