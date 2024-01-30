/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */
describe('shim V2 activity middleware', () => {
  test('replaces v1 activity and removes v2 activity', () =>
    runHTML('./middleware/shim.activity.replace-v1.remove-v2.html'));
});
