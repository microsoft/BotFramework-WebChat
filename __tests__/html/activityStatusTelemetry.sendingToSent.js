/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('ActivityStatusTelemetry', () => {
  test('activity status telemetry logged when activity status changed from "sending" to "sent"', () =>
    runHTML('activityStatusTelemetry.sendingToSent.html'));
});
