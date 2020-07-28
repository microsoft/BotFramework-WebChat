/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('Correct emoji should display if custom emojiSet has been set', () => {
  test('', () => runHTMLTest('emoji.enabled.customMap.html'));
});
