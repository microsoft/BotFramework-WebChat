/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('focus management', () => {
  test('click on suggested action should focus on main', () => runHTML('focusManagement.suggestedActions.html'));
});
