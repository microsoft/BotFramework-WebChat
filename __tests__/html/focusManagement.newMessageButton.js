/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('focus management', () => {
  test('click on new message button should focus on main', () => runHTMLTest('focusManagement.newMessageButton.html'));
});
