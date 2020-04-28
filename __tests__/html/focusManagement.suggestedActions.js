/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('focus management', () => {
  test('click on suggested action should focus on main', () => runHTMLTest('focusManagement.suggestedActions.html'));
});
