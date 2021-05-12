/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript activity status', () => {
  test('intermediate send failed', () => runHTML('transcript.activityStatus.intermediateSendFailed.html'));
});
