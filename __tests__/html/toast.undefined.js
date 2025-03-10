/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('notification toast', () => {
  test('should not break when showing a toast with undefined content', () => runHTML('toast.undefined.html'));
});
