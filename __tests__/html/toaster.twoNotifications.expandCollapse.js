/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('notification toast', () => {
  test('show 2 notifications, expand, and collapse', () => runHTML('toaster.twoNotifications.expandCollapse.html'));
});
