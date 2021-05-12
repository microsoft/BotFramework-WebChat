/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity grouping', () => {
  test('should group activity status after activities being sent', () =>
    runHTML('activityGrouping.groupingActivityStatus.html'));
});
