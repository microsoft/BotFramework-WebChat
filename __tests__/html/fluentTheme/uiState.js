/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('UI state should display properly in dark theme', () => runHTML('fluentTheme/uiState?theme=dark'));
  test('UI state should display properly in light theme', () => runHTML('fluentTheme/uiState?theme=light'));
  test('UI state should display properly in light theme and RTL', () => runHTML('fluentTheme/uiState?dir=rtl&theme=light'));
});
