/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('offline UI', () => {
  test('should show "Taking longer than usual to connect" UI when reconnection is slow', async () => {
    const { driver } = await loadPage('offlineUI.slowNetwork.reconnect.html');

    await expect(driver).resolves.toRunToCompletion();
  });
});
