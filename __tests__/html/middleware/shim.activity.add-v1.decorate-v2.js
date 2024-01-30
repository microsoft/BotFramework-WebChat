/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('shim V2 activity middleware', () => {
  test('adds a custom v1 activity with v2 decoration', () =>
    runHTML('./middleware/shim.activity.add-v1.decorate-v2.html'));
});
