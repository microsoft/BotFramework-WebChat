/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity grouping', () => {
  test('should not break legacy activity status middleware', () =>
    runHTML('activityGrouping.legacyActivityStatusMiddleware.html'));
});
