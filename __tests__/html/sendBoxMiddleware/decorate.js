/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('sendBoxMiddlware', () => {
  test('should decorate default send box', () => runHTML('sendBoxMiddleware/decorate'));
});
