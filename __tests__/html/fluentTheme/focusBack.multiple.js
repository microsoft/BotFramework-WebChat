/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied with multiple WebChat instances', () => {
  test('places focus back', () => runHTML('fluentTheme/focusBack.multiple'));
});
