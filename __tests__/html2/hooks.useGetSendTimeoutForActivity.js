/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('useGetSendTimeoutForActivity', () => {
  test('should return send timeout for activity with and without attachments', () =>
    runHTML('hooks.useGetSendTimeoutForActivity.html'));
});
