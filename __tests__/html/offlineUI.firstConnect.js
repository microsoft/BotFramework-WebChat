/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('offline UI', () => {
  test('should display the "Connecting..." connectivity status when connecting for the first time', () =>
    runHTMLTest('offlineUI.firstConnect.html'));
});
