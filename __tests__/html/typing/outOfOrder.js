/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('bot typing message in out-of-order fashion', () => {
  test('should sort typing activity in its original order', () => runHTML('typing/outOfOrder'));
});
