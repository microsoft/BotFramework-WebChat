/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('useScrollUp and useScrollDown hook', () => {
  test('should scroll', () => runHTMLTest('hooks.useScrollUpDown.html'));
});
