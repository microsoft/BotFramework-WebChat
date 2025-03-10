/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('focus management', () => {
  test('click on retry button should focus on main', () =>
    runHTML('focusManagement.sendFailedRetry.html'));
});
