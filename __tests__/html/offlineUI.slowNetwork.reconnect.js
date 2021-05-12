/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('offline UI', () => {
  test('should show "Taking longer than usual to connect" UI when reconnection is slow', () =>
    runHTML('offlineUI.slowNetwork.reconnect.html'));
});
