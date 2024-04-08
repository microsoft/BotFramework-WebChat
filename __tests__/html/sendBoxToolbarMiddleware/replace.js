/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('sendBoxToolbarMiddleware', () => {
  test('should replace default send box toolbar', () => runHTML('sendBoxToolbarMiddleware/replace'));
});
