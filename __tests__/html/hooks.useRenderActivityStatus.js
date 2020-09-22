/**
 * @jest-environment ./__tests__/html/__jest__/perTest/WebChatEnvironment.js
 */

describe('useRenderActivityStatus', () => {
  test('should render activity status', () => runHTMLTest('hooks.useRenderActivityStatus.html'));
});
