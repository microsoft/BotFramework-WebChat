/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('activity grouping', () => {
  test('should not break avatar middleware', () =>
    runHTML('activityGrouping.avatarMiddleware.html', {
      height: 1280
    }));
});
