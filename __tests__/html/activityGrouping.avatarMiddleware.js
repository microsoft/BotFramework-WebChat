/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity grouping', () => {
  test('should not break avatar middleware', () => runHTML('activityGrouping.avatarMiddleware.html'));
});
