/*eslint no-useless-escape: "off"*/
/*eslint require-unicode-regexp: "off" */
import useStyleOptions from './useStyleOptions';

function escapeRegexp(emoticon) {
  return emoticon.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
}

export default function useEmojiFromStyles() {
  const [{ emojiAutocorrect: autocorrect, emojiList: customEmojiList }] = useStyleOptions();

  const emojiAutocorrect = autocorrect || false;

  const emojiUnicodeMap = customEmojiList || {
    ':)': '😊',
    ':-)': '😊',
    '(:': '😊',
    '(-:': '😊',
    ':-|': '😐',
    ':|': '😐',
    ':-D': '😀',
    ':D': '😀',
    ':-p': '😛',
    ':p': '😛',
    ':-P': '😛',
    ':P': '😛',
    ':-o': '😲',
    ':o': '😲',
    ':O': '😲',
    ':-O': '😲',
    ':-0': '😲',
    ':0': '😲',
    ';-)': '😉',
    ';)': '😉',
    '<3': '❤️',
    '</3': '💔',
    '<\\3': '💔'
  };

  const escapedString =
    customEmojiList &&
    Object.keys(customEmojiList)
      .map(escapeRegexp)
      .join('|');

  const emojiRegExp = customEmojiList
    ? new RegExp(escapedString, 'gum')
    : new RegExp(/([:<()\\|\/3DPpoO0-]{2,3})/, 'gum');

  return [{ emojiAutocorrect, emojiUnicodeMap, emojiRegExp }];
}
