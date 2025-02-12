/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity middleware', () => {
  test('replaces activity and removes activity', () =>
    runHTML('./middleware/shim-v2-v1/activity.replace.remove.html'));
});
