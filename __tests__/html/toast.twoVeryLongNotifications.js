/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('notification toast', () => {
  test('show two very long notifications', () => runHTML('toast.twoVeryLongNotifications.html'));
});
