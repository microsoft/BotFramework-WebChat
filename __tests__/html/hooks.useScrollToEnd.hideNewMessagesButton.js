/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('useScrollToEnd.hideNewMessagesButton', () => {
  test('should scroll to end and hide "New Messages" button', () =>
    runHTMLTest('hooks.useScrollToEnd.hideNewMessagesButton.html'));
});
