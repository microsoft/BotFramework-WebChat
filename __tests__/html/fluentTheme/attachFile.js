/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('attach a single file', () => runHTML('fluentTheme/attachFile'));
});
