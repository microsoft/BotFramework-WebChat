/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('useCreateAvatarRenderer', () => {
  test('should render avatar', () => runHTMLTest('hooks.useCreateAvatarRenderer.html'));
});
