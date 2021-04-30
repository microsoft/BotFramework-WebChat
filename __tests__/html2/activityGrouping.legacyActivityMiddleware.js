/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('activity grouping', () => {
  test('should not break legacy activity middleware', () =>
    runHTML('activityGrouping.legacyActivityMiddleware.html', { height: 1280 }));
});
