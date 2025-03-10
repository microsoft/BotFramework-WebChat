/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('notification toast', () => {
  test('show a notification, update, and dismiss it', () => runHTML('toast.showUpdateDismiss.html'));
});
