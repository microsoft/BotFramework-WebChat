/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('link definition', () => {
  test('should display identifier of type string', () => runHTML('linkDefinition/identifierAsString.html'));
});
