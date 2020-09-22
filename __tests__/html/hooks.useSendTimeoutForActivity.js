/**
 * @jest-environment ./__tests__/html/__jest__/perTest/WebChatEnvironment.js
 */

describe('useSendTimeoutForActivity', () => {
  test('should return send timeout for activity with and without attachments', () =>
    runHTMLTest('hooks.useSendTimeoutForActivity.html'));
});
