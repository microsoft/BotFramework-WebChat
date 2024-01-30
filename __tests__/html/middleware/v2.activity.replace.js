/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('V2 activity middleware', () => {
  test('replaces an activity by text', () => runHTML('./middleware/v2.activity.replace.html'));
});
