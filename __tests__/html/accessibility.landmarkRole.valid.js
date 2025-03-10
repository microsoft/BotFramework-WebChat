/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility feature to support "role" attribute', () => {
  test('should set "role" if it is valid landmark role', () =>
    runHTML('accessibility.landmarkRole.valid'));
});
