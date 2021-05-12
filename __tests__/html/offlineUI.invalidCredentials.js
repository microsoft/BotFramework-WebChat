/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('offline UI', () => {
  test('should show "unable to connect" UI when credentials are incorrect', () =>
    runHTML('offlineUI.invalidCredentials.html'));
});
