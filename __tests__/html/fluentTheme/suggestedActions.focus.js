/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('suggested actions roving focus', () => runHTML('fluentTheme/suggestedActions.focus'));
});
