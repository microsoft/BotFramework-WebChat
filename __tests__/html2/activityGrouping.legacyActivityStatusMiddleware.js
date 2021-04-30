/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('activity grouping', () => {
  test('should not break legacy activity status middleware', () =>
    runHTML('activityGrouping.legacyActivityStatusMiddleware.html', { height: 1280 }));
});
