/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('focus management', () => {
  test('click on retry button should focus on main', () =>
    runHTMLTest('focusManagement.sendFailedRetry.html', { ignoreConsoleError: true }));
});
