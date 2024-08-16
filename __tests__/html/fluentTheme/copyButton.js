/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('copy button should work', () => runHTML('fluentTheme/copyButton'));
});
