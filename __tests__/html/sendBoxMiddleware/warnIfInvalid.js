/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('sendBoxMiddleware', () => {
  test('when passing invalid should warn and show default send box', () => runHTML('sendBoxMiddleware/warnIfInvalid'));
});
