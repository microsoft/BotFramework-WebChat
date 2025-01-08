/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('expired typing indicator', () => {
  test('should not revive when an OOO message is received', () => runHTML('typing/typingIndicator.shouldNotRevive'));
});
