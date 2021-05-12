/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity grouping', () => {
  test('should show timestamp even if timestamp is disabled', () =>
    runHTML('activityGrouping.disableTimestamp.html'));
});
