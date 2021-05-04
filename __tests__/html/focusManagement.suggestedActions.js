/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('focus management', () => {
  test('click on suggested action should focus on main', () => runHTML('focusManagement.suggestedActions.html'));
});
