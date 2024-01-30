/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('V1 activity middleware', () => {
  test('adds custom activity with decoration', () => runHTML('./middleware/v1.activity.add.decorate.html'));
});
