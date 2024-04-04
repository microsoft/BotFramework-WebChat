/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity middleware', () => {
  test('decorates an activity by text', () => runHTML('./middleware/v2/activity.decorate.html'));
});
