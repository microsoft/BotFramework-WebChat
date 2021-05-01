/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('transcript activity status', () => {
  test('intermediate send failed', () => runHTML('transcript.activityStatus.intermediateSendFailed.html'));
});
