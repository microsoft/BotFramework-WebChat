/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('V2 activity middleware', () => {
  test('adds custom activity', () => runHTML('./middleware/v2.activity.add.html'));
});
