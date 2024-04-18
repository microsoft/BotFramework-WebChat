/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('uses fluent theme if present', () => runHTML('fluentTheme/fluentThemeFallback'));
});
