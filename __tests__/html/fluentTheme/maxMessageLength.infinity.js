/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('handles max message length of Infinity', () => runHTML('fluentTheme/maxMessageLength.infinity'));
});
