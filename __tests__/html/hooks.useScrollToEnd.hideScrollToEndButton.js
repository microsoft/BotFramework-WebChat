/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useScrollToEnd.hideScrollToEndButton', () => {
  test('should scroll to end and hide scroll to end button', () =>
    runHTML('hooks.useScrollToEnd.hideScrollToEndButton.html'));
});
