/**
 * @jest-environment ./__tests__/html/__jest__/perTest/WebChatEnvironment.js
 */

describe('accessibility requirement', () => {
  test('should not delay activity without "replyToId"', () =>
    runHTMLTest('accessibility.delayActivity.withoutReplyToId.html'));
});
