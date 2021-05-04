/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('offline UI', () => {
  test('should show "Render error" connectivity status when a JavaScript error is present in the code.', () =>
    runHTML('offlineUI.fatalError.html'));
});
