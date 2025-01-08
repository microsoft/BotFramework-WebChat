/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useTypingIndicatorVisible', () => {
  test('setter should be falsy', () => runHTML('hooks/useTypingIndicatorVisible/setter.html'));
});
