/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('performs transcript navigation', () => runHTML('fluentTheme/transcript.navigation.pageUpDown'));
});
