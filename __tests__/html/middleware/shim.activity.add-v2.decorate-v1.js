/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('shim V2 activity middleware', () => {
  test('adds a custom v2 activity with v1 decoration', () =>
    runHTML('./middleware/shim.activity.add-v2.decorate-v1.html'));
});
