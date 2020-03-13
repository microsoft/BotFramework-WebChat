/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('offline UI', () => {
  test('should display "Send failed. Retry" when activity is sent but not acknowledged', async () => {
    const { driver } = await loadHTMLTest('offlineUI.sendFailed.noAck.html');

    await expect(driver).resolves.toRunToCompletion();
  });
});
