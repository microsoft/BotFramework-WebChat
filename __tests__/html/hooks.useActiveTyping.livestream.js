/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useActiveTyping', () => {
  test('should get bot livestream', () => runHTML('hooks.useActiveTyping.livestream.html'));
});
