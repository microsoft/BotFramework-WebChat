/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('V1 activity middleware', () => {
  test('replaces an activity by text', () => runHTML('./middleware/v1.activity.replace.html'));
});
