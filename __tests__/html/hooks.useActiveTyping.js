/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useActiveTyping', () => {
  test('should get bot and user typings', () => runHTML('hooks.useActiveTyping.html'));
});
