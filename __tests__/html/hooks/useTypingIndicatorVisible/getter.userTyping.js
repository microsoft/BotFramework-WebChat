/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useTypingIndicatorVisible', () => {
  test('getter should return false when user is typing', () => runHTML('hooks/useTypingIndicatorVisible/getter.userTyping.html'));
});
