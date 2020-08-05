/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('useGetSendTimeoutForActivity', () => {
  test('should return send timeout for activity with and without attachments', () =>
    runHTMLTest('hooks.useGetSendTimeoutForActivity.html'));
});
