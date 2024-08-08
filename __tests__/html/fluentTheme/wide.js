/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent UX with two chats', () => {
  test('wide', () => runHTML('fluentTheme/wide'));
  test('wide with content', () => runHTML('fluentTheme/wide?transcript=0&transcript=0'));
});
