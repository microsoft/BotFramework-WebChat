/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('shim V2 activity middleware', () => {
  test('removes v1 activity and replaces v2 activity', () =>
    runHTML('./middleware/shim.activity.remove-v1.replace-v2.html'));
});
