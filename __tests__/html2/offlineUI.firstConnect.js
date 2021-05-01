/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('offline UI', () => {
  test('should display the "Connecting..." connectivity status when connecting for the first time', () =>
    runHTML('offlineUI.firstConnect.html'));
});
