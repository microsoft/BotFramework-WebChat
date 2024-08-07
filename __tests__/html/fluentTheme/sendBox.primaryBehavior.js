/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('should be wired to useSendBoxValue', () => runHTML('fluentTheme/sendBox.primaryBehavior'));
});
