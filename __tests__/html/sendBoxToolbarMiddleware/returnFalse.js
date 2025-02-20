/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('sendBoxToolbarMiddleware', () => {
  test('when return false should hide default send box toolbar', () => runHTML('sendBoxMiddleware/returnFalse'));
});
