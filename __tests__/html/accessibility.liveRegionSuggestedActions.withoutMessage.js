/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  describe('suggested actions in live region', () =>
    test('without message', () => runHTML('accessibility.liveRegionSuggestedActions.withoutMessage.html')));
});
