/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity grouping', () => {
  test('should not break legacy activity middleware', () => runHTML('activityGrouping.legacyActivityMiddleware.html'));
});
