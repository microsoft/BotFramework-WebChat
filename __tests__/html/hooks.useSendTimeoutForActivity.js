/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useSendTimeoutForActivity', () => {
  test('should return send timeout for activity with and without attachments', () =>
    runHTML('hooks.useSendTimeoutForActivity.html'));
});
