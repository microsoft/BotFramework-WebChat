/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('typing indicator in live region', () => {
  test('should display from.name', () => runHTML('typingIndicator.liveRegion.fromName.html'));
});
