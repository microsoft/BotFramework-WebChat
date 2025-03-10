/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('text url attachment sent from bot should trigger status change telemetry event', () => runHTML('activityStatusTelemetry.sendFiles.attachmentUrl.sendingToSent.html')
);
