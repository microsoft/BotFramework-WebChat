/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('scroll to end button', () => {
  test('should show for livestreaming session', () => runHTML('scrollToEndButton.livestreaming.html'));
});
