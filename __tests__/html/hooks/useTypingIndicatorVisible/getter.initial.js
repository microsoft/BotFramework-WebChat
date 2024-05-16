/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useTypingIndicatorVisible', () => {
  test('getter should return false when typing indicator is not shown', () => runHTML('hooks/useTypingIndicatorVisible/getter.initial.html'));
});
