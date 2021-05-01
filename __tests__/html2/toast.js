/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('notification toast', () => {
  test('should show privacy policy', () => runHTML('toast.html'));
});
