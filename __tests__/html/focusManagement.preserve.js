/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('focus management', () => {
  test('focus should be preserved when enering activity', () => runHTML('focusManagement.preserve.html'));
});
