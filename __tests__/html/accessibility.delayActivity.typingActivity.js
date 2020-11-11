/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('accessibility requirement', () => {
  test('activity should not be delayed due to user typing activity', () =>
    runHTMLTest('accessibility.delayActivity.typingActivity.html'));
});
