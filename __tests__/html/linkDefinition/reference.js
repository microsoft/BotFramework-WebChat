/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('link definition', () => {
  test('should reference sample', () => runHTML('linkDefinition/reference.html'));
});
