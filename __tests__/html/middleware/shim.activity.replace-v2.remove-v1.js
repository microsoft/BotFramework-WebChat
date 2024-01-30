/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('shim V2 activity middleware', () => {
  test('replaces v2 activity and removes v1 activity', () =>
    runHTML('./middleware/shim.activity.replace-v2.remove-v1.html'));
});
