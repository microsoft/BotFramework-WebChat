/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity grouping', () => {
  test('should accept valid or invalid custom middleware', () => runHTML('activityGrouping.customMiddleware.html'));
});
