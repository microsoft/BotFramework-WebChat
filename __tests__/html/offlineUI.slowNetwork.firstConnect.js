/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('offline UI', () => {
  test('should show "Taking longer than usual to connect" UI when connection is slow', async () => {
    const { driver } = await loadPage('offlineUI.slowNetwork.firstConnect.html');

    await expect(driver).resolves.toRunToCompletion();
  });
});
