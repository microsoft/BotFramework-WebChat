/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('with decorators', () => runHTML('fluentTheme/withDecorator'));
});
