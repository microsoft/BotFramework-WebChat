/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('shim V2 activity middleware', () => {
  test('removes v2 activity and replaces v1 activity', () =>
    runHTML('./middleware/shim.activity.remove-v2.replace-v1.html'));
});
