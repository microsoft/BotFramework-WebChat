/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('sendBoxToolbarMiddleware', () => {
  test('when passing invalid should warn and show default send box toolbar', () =>
    runHTML('sendBoxToolbarMiddleware/warnIfInvalid'));
});
