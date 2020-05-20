/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('focus management', () => {
  test('focus should not move after the whole UI is disabled', () => runHTMLTest('focusManagement.disableUI.html'));
});
