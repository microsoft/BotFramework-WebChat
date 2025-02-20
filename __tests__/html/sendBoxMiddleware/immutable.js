/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('sendBoxMiddleware', () => {
  test('when mutated should be treated as immutable', () => runHTML('sendBoxMiddleware/immutable'));
});
