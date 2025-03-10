/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('timestamp', () => {
  test('send timeout for attachment should be different', () =>
    runHTML('timestamp.attachmentSendTimeout.html'));
});
