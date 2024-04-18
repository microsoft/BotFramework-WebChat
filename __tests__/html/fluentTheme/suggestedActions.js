/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('renders suggested actions', () => runHTML('fluentTheme/suggestedActions'));
});
