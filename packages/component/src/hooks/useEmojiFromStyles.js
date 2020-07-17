/*eslint require-unicode-regexp: "off" */

import { useMemo } from 'react';

import useStyleOptions from './useStyleOptions';

function escapeRegexp(emoticon) {
  return emoticon.replace(/[\\^$*+?.()|[\]{}]/gu, '\\$&');
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
  };

  const escapedString =
    customEmojiList &&
    Object.keys(customEmojiList)
      .map(escapeRegexp)
      .join('|');

  const emojiRegExp = useMemo(
    () => (customEmojiList ? new RegExp(escapedString, 'gmu') : new RegExp(/([:<()\\|/3DPpoO0-]{2,3})/gmu)),
    [customEmojiList, escapedString]
  );

  return [{ emojiAutocorrect, emojiUnicodeMap, emojiRegExp }];
}
