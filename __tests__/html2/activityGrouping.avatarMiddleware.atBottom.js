/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('activity grouping', () => {
  test('should not break avatar middleware with avatar at bottom', () =>
    runHTML('activityGrouping.avatarMiddleware.atBottom.html'));
});
