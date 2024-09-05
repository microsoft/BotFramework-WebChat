/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('UI state should display properly', () => runHTML('fluentTheme/uiState'));
});
