/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('scroll to end button', () => {
  test('should hide for typing indicator.', () => runHTML('scrollToEndButton.typingIndicator.html'));
});
