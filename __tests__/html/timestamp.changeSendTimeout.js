/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('timestamp', () => {
  test('change send timeout on-the-fly', () => runHTML('timestamp.changeSendTimeout.html'));
});
