/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('sendBoxToolbarMiddleware', () => {
  test('should decorate default send box toolbar', () => runHTML('sendBoxToolbarMiddleware/decorate'));
});
