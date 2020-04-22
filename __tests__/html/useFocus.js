/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('useFocus', () => {
  test('on main', () => runHTMLTest('useFocus.main.html'));
  test('on send box', () => runHTMLTest('useFocus.sendBox.html'));
});
