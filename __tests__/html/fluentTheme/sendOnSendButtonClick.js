/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('send on send button click', () => runHTML('fluentTheme/sendOnSendButtonClick'));
});
