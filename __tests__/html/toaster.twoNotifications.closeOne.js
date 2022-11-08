/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('notification toast', () => {
  test('show 2 notifications, expand, close one, and add new', () => runHTML('toaster.twoNotifications.closeOne.html'));
});
