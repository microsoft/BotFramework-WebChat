/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied in non-English language', () => {
  test('blueprint state should match normal state', () => runHTML('fluentTheme/uiState.blueprint.nonEnglish'));
});
