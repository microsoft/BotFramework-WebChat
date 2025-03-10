/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('handles max message length exceeded', () => runHTML('fluentTheme/maxMessageLength'));
});
