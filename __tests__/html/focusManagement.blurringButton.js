/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('focus management', () => {
  test('when blurring should move to the first element in the trap', () =>
    runHTML('focusManagement.blurringButton.html'));
});
