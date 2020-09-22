/**
 * @jest-environment ./__tests__/html/__jest__/perTest/WebChatEnvironment.js
 */

describe('useCreateActivityRenderer', () => {
  test('should render activity', () => runHTMLTest('hooks.useCreateActivityRenderer.html'));
});
