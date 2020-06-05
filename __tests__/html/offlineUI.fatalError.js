/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('offline UI', () => {
  test('should show "Render error" connectivity status when a JavaScript error is present in the code.', () =>
    runHTMLTest('offlineUI.fatalError.html', { ignoreConsoleError: true, ignorePageError: true }));
});
