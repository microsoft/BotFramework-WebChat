/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('bot typing with chunks', () => {
  test('should display partial message', () => runHTML('typing/chunk'));
});
