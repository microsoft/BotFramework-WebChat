/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useScrollTo.keepScrollToEndButton', () => {
  test('should scroll and keep scroll to end button', () =>
    runHTML('hooks.useScrollTo.keepScrollToEndButton.html'));
});
