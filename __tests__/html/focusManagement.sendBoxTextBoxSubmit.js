/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('focus management', () => {
  test('press ENTER on send box text box should continue to focus on send box', () =>
    runHTML('focusManagement.sendBoxTextBoxSubmit.html'));
});
