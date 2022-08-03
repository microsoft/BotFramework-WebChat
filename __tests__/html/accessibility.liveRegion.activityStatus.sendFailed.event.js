/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('live region', () => {
  test('should not narrate "failed to send message" through live region for event activity', () =>
    runHTML('accessibility.liveRegion.activityStatus.sendFailed.event.html'));
});
