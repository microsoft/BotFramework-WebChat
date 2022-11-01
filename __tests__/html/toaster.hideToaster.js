/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('notification toast', () => {
  test('hide toaster', () => runHTML('toaster.hideToaster.html'));
});
