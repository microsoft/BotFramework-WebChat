/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('useCreateActivityRenderer', () => {
  test('should render activity', () => runHTMLTest('hooks.useCreateActivityRenderer.html'));
});
