/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('offline UI', () => {
  test('should show "unable to connect" UI when credentials are incorrect', async () => {
    const { driver } = await loadPage('offlineUI.invalidCredentials.html');

    await expect(driver).resolves.toRunToCompletion();
  });
});
