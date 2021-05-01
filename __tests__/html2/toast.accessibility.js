/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('toast', () => {
  test('should have valid aria-labelled-by.', () => runHTML('toast.accessibility.html'));
});
