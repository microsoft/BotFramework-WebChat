/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useObserveScrollPosition', () => {
  test('should observe scroll position changes', () => runHTML('hooks.useObserveScrollPosition.html'));
});
