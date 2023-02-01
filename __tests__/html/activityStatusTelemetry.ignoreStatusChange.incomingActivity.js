/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('ActivityStatusTelemetry', () => {
  test('activity status telemetry should not be logged when incoming activity received', () =>
    runHTML('activityStatusTelemetry.ignoreStatusChange.incomingActivity.html'));
});
