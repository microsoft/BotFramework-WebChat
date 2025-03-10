/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('typing indicator in live region', () => {
  test('with multiple participants should display properly', () => runHTML('typingIndicator.liveRegion.multiple.html'));
});
