/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('suggested actions', () => {
  describe('roving tab index', () => {
    test('should be wraparound', () => runHTML('suggestedActions.rovingTabIndex.wraparound.html'));
  });
});
