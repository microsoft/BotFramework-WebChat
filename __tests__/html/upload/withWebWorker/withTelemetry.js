/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('with Web Worker upload a picture', () => {
  test('should send telemetry', () => runHTML('upload/withWebWorker/withTelemetry'));
});
