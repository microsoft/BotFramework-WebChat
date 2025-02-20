/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('renders suggested actions with a flow layout', () => runHTML('fluentTheme/suggestedActions.layout.flow'));
});
