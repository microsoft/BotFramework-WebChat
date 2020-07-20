/*eslint require-unicode-regexp: "off" */

import useStyleOptions from './useStyleOptions';

export default function useEmojiFromStyles() {
  const [{ emojiSet }] = useStyleOptions();

  const emojiUnicodeMap =
    typeof emojiSet === 'object'
      ? emojiSet
      : emojiSet === true
      ? {
          ':)': '😊',
          ':-)': '😊',
          '(:': '😊',
          '(-:': '😊',
          ':-|': '😐',
          ':|': '😐',
          ':-(': '☹️',
          ':(': '☹️',
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
        }
      : false;

  return [{ emojiUnicodeMap }];
}
