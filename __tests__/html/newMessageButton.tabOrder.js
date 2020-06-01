/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('new message button', () => {
  test('tab order', () => runHTMLTest('newMessageButton.tabOrder.html'));
});
