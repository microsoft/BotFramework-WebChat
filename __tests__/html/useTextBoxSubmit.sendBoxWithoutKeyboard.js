/**
 * @jest-environment ./__tests__/html/__jest__/perTest/WebChatEnvironment.js
 */

test('useTextBoxSubmit and set focus to "sendBoxWithoutKeyboard"', () =>
  runHTMLTest('useTextBoxSubmit.sendBoxWithoutKeyboard.html'));
