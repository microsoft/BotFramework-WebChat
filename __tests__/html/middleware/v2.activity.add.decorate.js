/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('V2 activity middleware', () => {
  test('adds custom activity with decoration', () => runHTML('./middleware/v2.activity.add.decorate.html'));
});
