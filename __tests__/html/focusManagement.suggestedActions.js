/**
 * @jest-environment ./__tests__/html/__jest__/perTest/WebChatEnvironment.js
 */

describe('focus management', () => {
  test('click on suggested action should focus on main', () => runHTMLTest('focusManagement.suggestedActions.html'));
});
