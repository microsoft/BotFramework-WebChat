/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('bot typing multiple messages', () => {
  test('should work properly', () => runHTML('typing/simultaneous'));
});
