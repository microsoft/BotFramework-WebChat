/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('toast', () => {
  test('should have valid aria-labelled-by.', () => runHTML('toast.accessibility.html'));
});
