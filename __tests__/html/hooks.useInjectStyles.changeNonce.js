/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useInjectStyles', () => {
  test('should change nonce', () => runHTML('hooks.useInjectStyles.changeNonce.html'));
});
