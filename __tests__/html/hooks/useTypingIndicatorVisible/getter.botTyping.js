/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useTypingIndicatorVisible', () => {
  test('getter should return true when typing indicator is shown', () => runHTML('hooks/useTypingIndicatorVisible/getter.botTyping.html'));
});
