/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('drag and drop upload', () => runHTML('fluentTheme/dragAndDrop.upload'));
});
