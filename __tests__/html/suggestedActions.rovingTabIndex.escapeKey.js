/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('suggested actions', () => {
  describe('roving tab index', () => {
    test('press ESCAPE key should focus on send box', () => runHTML('suggestedActions.rovingTabIndex.escapeKey.html'));
  });
});
