/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('update activity', () => {
  test('should replace activity with same activity ID', () => runHTML('updateActivity.sameActivityId.html'));
});
