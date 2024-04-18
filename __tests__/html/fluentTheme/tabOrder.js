/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('tab order', () => runHTML('fluentTheme/tabOrder'));
});
