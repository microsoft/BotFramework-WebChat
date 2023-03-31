/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('ponyfill', () => {
  test('should warn if only set in React', () => runHTML('ponyfill.reactOnly.html'));
});
