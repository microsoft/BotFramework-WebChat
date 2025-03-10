/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('simple', () => {
  test('should render UI.', () => runHTML('simple.html'));
});
