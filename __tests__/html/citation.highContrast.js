/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('citation in high contrast', () => {
  test('should work', () => runHTML('citation.highContrast.html'));
});
