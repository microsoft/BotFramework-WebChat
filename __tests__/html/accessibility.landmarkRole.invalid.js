/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility feature to support "role" attribute', () => {
  test('should fallback to "complementary" if not a valid landmark role', () =>
    runHTML('accessibility.landmarkRole.invalid'));
});
