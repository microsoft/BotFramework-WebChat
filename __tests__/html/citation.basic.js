/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('citation', () => {
  test('should display', () => runHTML('citation.basic.html'));
});
