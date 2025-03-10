/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('built-in decorator', () => {
  test('with decorators', () => runHTML('withBuiltinDecorator'));
});
