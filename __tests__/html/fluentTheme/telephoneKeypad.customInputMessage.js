/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('telephone keypad should show custom message', () => runHTML('fluentTheme/telephoneKeypad.customInputMessage'));
});
