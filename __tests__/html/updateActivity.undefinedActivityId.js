/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('update activity', () => {
  test('should not replace activity without activity ID', () => runHTML('updateActivity.undefinedActivityId.html'));
});
