/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity', () => {
  test('should not show unknown activity', () => runHTML('activity.unknownActivity.html'));
});
