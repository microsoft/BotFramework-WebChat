/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('sendBoxMiddleware', () => {
  test('should decorate default send box', () => runHTML('sendBoxMiddleware/decorate'));
});
