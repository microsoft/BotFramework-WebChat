/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('telephone keypad when tapped should send message', () => runHTML('fluentTheme/telephoneKeypad.tap'));
});
