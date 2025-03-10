/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('scroll to end button', () => {
  test('should have correct tab order', () => runHTML('scrollToEndButton.tabOrder.html'));
});
