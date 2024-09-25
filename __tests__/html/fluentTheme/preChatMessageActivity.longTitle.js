/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('should layout properly with very long title and subtitle', () => runHTML('fluentTheme/preChatMessageActivity.longTitle'));
});
