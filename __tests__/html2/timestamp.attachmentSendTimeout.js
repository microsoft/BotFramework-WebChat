/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('timestamp', () => {
  test('send timeout for attachment should be different', () =>
    runHTML('timestamp.attachmentSendTimeout.html'));
});
