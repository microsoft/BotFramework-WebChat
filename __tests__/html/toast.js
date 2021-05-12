/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('notification toast', () => {
  test('should show privacy policy', () => runHTML('toast.html'));
});
