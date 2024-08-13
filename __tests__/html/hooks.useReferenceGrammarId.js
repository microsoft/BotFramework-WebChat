/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useReferenceGrammarId', () => {
  test('should return value', () => runHTML('hooks.useReferenceGrammarId.html'));
});
