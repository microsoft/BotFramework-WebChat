/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

test('Emoji should be disabled when emojiSet is set to false', () => runHTMLTest('styleOptions.emojiSet.disabled.html'));
