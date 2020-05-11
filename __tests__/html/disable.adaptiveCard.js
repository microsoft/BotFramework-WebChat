/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('disable controls', () => {
  test('on Adaptive Cards', () => runHTMLTest('disable.adaptiveCard.html'));
});
