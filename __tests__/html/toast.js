/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('notification toast', () => {
  test('should show privacy policy', async () => {
    const { driver } = await loadPage('toast.html');

    await expect(driver).resolves.toRunToCompletion();
  });
});
