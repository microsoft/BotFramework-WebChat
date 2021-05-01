/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('useSendTimeoutForActivity', () => {
  test('should return send timeout for activity with and without attachments', () =>
    runHTML('hooks.useSendTimeoutForActivity.html'));
});
