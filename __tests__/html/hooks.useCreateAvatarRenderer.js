/**
 * @jest-environment ./__tests__/html/__jest__/perTest/WebChatEnvironment.js
 */

describe('useCreateAvatarRenderer', () => {
  test('should render avatar', () => runHTMLTest('hooks.useCreateAvatarRenderer.html'));
});
