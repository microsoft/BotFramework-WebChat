/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useActiveTyping', () => {
  test('should not have setter', () => runHTML('hooks.useActiveTyping.setter.html'));
});
