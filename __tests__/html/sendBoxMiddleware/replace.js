/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('sendBoxMiddleware', () => {
  test('should replace default send box', () => runHTML('sendBoxMiddleware/replace'));
});
