/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity middleware', () => {
  test('adds a custom activity with decoration', () => runHTML('./middleware/v1/activity.add.decorate.html'));
});
