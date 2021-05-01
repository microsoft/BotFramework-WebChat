/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('DirectLine', () => {
  test('should set user ID if setUserID function is provided', () => runHTML('directLine.setUserId.html'));
});
