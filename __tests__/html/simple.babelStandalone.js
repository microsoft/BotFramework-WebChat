/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('simple', () => {
  test('when using @babel/standalone should render UI.', () => runHTML('simple.babelStandalone.html'));
});
