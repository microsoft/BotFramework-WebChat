/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('Emoji should be disabled if emoji style props have not been changed', () => {
  test('', () => runHTMLTest('emoji.disabled.html'));
});
