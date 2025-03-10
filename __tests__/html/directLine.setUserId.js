/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('DirectLine', () => {
  test('should set user ID if setUserID function is provided', () => runHTML('directLine.setUserId.html'));
});
