/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('accessibility requirement', () => {
  test('activity should be delayed due to non-existing activity', () =>
    runHTMLTest('accessibility.delayActivity.typingActivityWithoutReplyToActivity.html'));
});
