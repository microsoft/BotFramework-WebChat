/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('sendBoxMiddleware', () => {
  test('when return false should hide default send box', () => runHTML('sendBoxMiddleware/returnFalse'));
});
