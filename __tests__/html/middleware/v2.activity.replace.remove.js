/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('V2 activity middleware', () => {
  test('replaces activity and removes activity', () => runHTML('./middleware/v2.activity.replace.remove.html'));
});
