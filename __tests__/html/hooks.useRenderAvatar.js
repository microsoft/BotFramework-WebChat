/**
 * @jest-environment ./__tests__/html/__jest__/perTest/WebChatEnvironment.js
 */

describe('useRenderAvatar', () => {
  test('should render avatar', () => runHTMLTest('hooks.useRenderAvatar.html'));
});
