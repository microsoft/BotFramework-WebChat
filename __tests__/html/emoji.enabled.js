/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('Correct emoji should display if emojiAutocorrect has been set to true', () => {
  test('', () => runHTMLTest('emoji.enabled.html'));
  test('and a custom emojiUnicodeMap has been set', () => runHTMLTest('emoji.enabledCustomMapDefaultRegExp.html'));
  test('and a custom emojiUnicodeMap and custom emojiRegExp has been set', () =>
    runHTMLTest('emoji.enabledCustomMapCustomRegExp.html'));
});
