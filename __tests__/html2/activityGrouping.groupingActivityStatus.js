/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('activity grouping', () => {
  test('should group activity status after activities being sent', () =>
    runHTML('activityGrouping.groupingActivityStatus.html', { height: 1280 }));
});
