/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useGetSendTimeoutForActivity', () => {
  test('should return send timeout for activity with and without attachments', () =>
    runHTML('hooks.useGetSendTimeoutForActivity.html'));
});
