/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('ponyfill', () => {
  test('should not warn if set correctly', () => runHTML('ponyfill.html'));
});
