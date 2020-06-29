import useStyleOptions from './useStyleOptions';

export default function useEmojiFromStyles() {
  const [{ emojiAutocorrect: autocorrect, emojiList, emojiRegexp: regex }] = useStyleOptions();

  const emojiAutocorrect = autocorrect || false;

  const emojiUnicodeMap = emojiList || {
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
    ':-O': '😲',
    ':-O': '😲',
    ';-)': '😉',
    ';)': '😉',
    '<3': '❤️',
    '</3': '💔',
    '<\\3': '💔'
  };

  const emojiRegexp = regex || new RegExp(/([:<()\\/|3DPpoO0\-]{2,3})/, 'gim');

  return [{ emojiAutocorrect, emojiUnicodeMap, emojiRegexp }];
}
