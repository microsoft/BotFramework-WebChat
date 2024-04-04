/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity middleware', () => {
  test('adds a custom activity', () => runHTML('./middleware/v2/activity.add.html'));
});
