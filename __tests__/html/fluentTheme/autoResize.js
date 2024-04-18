/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('textbox auto resize', () => runHTML('fluentTheme/autoResize'));
});
