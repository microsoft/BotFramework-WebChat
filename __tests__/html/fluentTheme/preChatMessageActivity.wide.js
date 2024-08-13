/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('should display pre-chat message in wide format', () => runHTML('fluentTheme/preChatMessageActivity.wide'));
});
