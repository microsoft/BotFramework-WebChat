/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('focus moves back to sendbox when letter pressed', () => runHTML('fluentTheme/focusManagement.backToSendBox'));
});
