/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('notification toast', () => {
  test('move recently updated toast to the top', () => runHTML('toaster.moveRecentToTop.html'));
});
