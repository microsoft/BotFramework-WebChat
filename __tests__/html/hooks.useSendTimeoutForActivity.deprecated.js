/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('useSendTimeoutForActivity deprecated signature', () => {
  test('should return send timeout for activity with and without attachments', () =>
    runHTMLTest('hooks.useSendTimeoutForActivity.deprecated.html'));
});
