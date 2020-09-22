/**
 * @jest-environment ./__tests__/html/__jest__/perTest/WebChatEnvironment.js
 */

describe('offline UI', () => {
  test('should show "unable to connect" UI when credentials are incorrect', () =>
    runHTMLTest('offlineUI.invalidCredentials.html', { ignorePageError: true }));
});
