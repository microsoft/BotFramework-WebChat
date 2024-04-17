/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('should apply grid modifications', () => runHTML('fluentTheme/grid'));
});
