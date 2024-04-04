/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity middleware', () => {
  test('removes activity and replaces activity', () => runHTML('./middleware/v1/activity.remove.replace.html'));
});
