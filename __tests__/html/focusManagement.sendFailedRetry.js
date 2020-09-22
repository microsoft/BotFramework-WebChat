/**
 * @jest-environment ./__tests__/html/__jest__/perTest/WebChatEnvironment.js
 */

describe('focus management', () => {
  test('click on retry button should focus on main', () => runHTMLTest('focusManagement.sendFailedRetry.html'));
});
