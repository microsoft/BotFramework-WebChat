/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('sendBoxMiddlware', () => {
  test('when return false should hide default send box', () => runHTML('sendBoxMiddleware/returnFalse'));
});
