/**
 * @jest-environment ./__tests__/html/__jest__/perTest/WebChatEnvironment.js
 */

describe('useCreateActivityStatusRenderer', () => {
  test('should render activity status', () => runHTMLTest('hooks.useCreateActivityStatusRenderer.html'));
});
