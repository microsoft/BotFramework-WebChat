/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useActiveTyping', () => {
  test('should support variable timing', () => runHTML('hooks.useActiveTyping.variable.html'));
});
