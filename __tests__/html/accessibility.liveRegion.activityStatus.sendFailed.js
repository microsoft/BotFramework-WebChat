/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('live region', () => {
  test('should narrate "failed to send message" through live region', () =>
    runHTML('accessibility.liveRegion.activityStatus.sendFailed.html'));
});
