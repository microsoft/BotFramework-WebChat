/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('useFocus', () => {
  test('on send box without keyboard', () => runHTMLTest('useFocus.sendBoxWithoutKeyboard.html'));
});
