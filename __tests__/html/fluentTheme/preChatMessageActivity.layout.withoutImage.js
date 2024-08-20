/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('should layout properly without image', () => runHTML('fluentTheme/preChatMessageActivity.layout.withoutImage'));
});
