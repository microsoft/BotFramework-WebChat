/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('scroll to end button', () => {
  test('should ignore event activities', () => runHTML('scrollToEndButton.withEventActivities.html'));
});
