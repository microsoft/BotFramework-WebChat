/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('sendBoxMiddlware', () => {
  test('should replace default send box', () => runHTML('sendBoxMiddleware/replace'));
});
