/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('suggested actions', () => {
  describe('roving tab index', () => {
    test('stacked layout should be accessible with vertical navigation keys', () =>
      runHTML('suggestedActions.rovingTabIndex.vertical.html'));
  });
});
