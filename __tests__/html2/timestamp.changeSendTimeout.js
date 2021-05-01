/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('timestamp', () => {
  test('change send timeout on-the-fly', () => runHTML('timestamp.changeSendTimeout.html'));
});
