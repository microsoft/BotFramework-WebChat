/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('disable controls', () => {
  test('on hero card', () => runHTMLTest('disable.heroCard.html'));
});
