/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('sendBoxToolbarMiddleware', () => {
  test('when mutated should be treated as immutable', () => runHTML('sendBoxToolbarMiddleware/immutable'));
});
