/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('should handle coarse pointer', () => runHTML('fluentTheme/simple.coarsePointer'));
});
