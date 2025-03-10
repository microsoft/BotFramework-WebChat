/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('scroll to end button', () => {
  test('should show and hide properly', () => runHTML('scrollToEndButton.visibility.html'));
});
