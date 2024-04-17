/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('uses fluent dark theme if present', () => runHTML('fluentTheme/fluentThemeFallback.dark'));
});
