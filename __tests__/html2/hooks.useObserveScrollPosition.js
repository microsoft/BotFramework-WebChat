/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('useObserveScrollPosition', () => {
  test('should observe scroll position changes', () => runHTML('hooks.useObserveScrollPosition.html'));
});
