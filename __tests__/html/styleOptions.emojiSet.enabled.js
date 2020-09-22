/**
 * @jest-environment ./__tests__/html/__jest__/perTest/WebChatEnvironment.js
 */

test('Emoji should be enabled when emojiSet is set to true', () => runHTMLTest('styleOptions.emojiSet.enabled.html'));
