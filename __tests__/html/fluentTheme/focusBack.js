/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('places focus back', () => runHTML('fluentTheme/focusBack'));
});
