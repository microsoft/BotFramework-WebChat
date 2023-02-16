/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('suggested actions', () => {
  test('should scroll when flipper buttons are clicked', () => runHTML('suggestedActions.scroll.html'));
});
