/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useScrollTo hook', () => {
  test('should scroll based on activity ID', () => runHTML('hooks.useScrollTo.activityID.html'));
});
