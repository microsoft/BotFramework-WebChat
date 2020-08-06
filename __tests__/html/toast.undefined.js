/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('notification toast', () => {
  test('should not break when showing a toast with undefined content', () =>
    runHTMLTest('toast.undefined.html', { ignoreConsoleError: true }));
});
