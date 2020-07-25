/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('useCreateActivityStatusRenderer', () => {
  test('should render activity status', () => runHTMLTest('hooks.useCreateActivityStatusRenderer.html'));
});
