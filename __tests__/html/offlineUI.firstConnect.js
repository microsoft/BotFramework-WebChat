/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('offline UI', () => {
  test('should display the "Connecting..." connectivity status when connecting for the first time', () =>
    runHTML('offlineUI.firstConnect.html'));
});
