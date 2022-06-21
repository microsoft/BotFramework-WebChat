/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('suggested actions', () => {
  describe('roving tab index', () => {
    test('should reset after click', () => runHTML('suggestedActions.rovingTabIndex.resetAfterClick.html'));
  });
});
