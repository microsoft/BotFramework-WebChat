/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('live region', () => {
  test('should render "Send Failed. Retry" correctly in high-contrast mode', () =>
    runHTML('accessibility.liveRegion.activityStatus.sendFailed.contrast.html'));
});
