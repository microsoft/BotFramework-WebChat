/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('offline UI', () => {
  test('should show "Taking longer than usual to connect" UI when connection is slow', () =>
    runHTML('offlineUI.slowNetwork.firstConnect.html'));
});
