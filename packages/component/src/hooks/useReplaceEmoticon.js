/*eslint require-unicode-regexp: "off" */

import { useCallback, useMemo } from 'react';

import { useTextBoxValue } from '../SendBox/TextBox';
import useStyleOptions from './useStyleOptions';
import useEmojiFromStyles from './useEmojiFromStyles';

function escapeRegexp(emoticon) {
  return emoticon.replace(/[\\^$*+?.()|[\]{}]/gu, '\\$&');
}

export default function useReplaceEmoticon() {
  const [{ emojiUnicodeMap }] = useEmojiFromStyles();

  const escapedString = useMemo(
    () =>
      typeof emojiUnicodeMap === 'object' &&
      Object.keys(emojiUnicodeMap)
        .map(escapeRegexp)
        .join('|'),
    [emojiUnicodeMap]
  );

  const emojiRegExp = useMemo(
    () =>
      typeof emojiUnicodeMap === 'object'
        ? new RegExp(escapedString, 'gmu')
        : new RegExp(/([:<()\\|/3DPpoO0-]{2,3})/gmu),
    [emojiUnicodeMap, escapedString]
  );

  const [value] = useTextBoxValue();
  const setEmoji = useCallback(
    value => {
      const emoticon = value.match(emojiRegExp);

      if (!!emojiUnicodeMap && emoticon && emojiUnicodeMap[emoticon]) {
        value = value.replace(emoticon, emojiUnicodeMap[emoticon]);
      }

      return value;
    },
    [emojiUnicodeMap, emojiRegExp]
  );

  return [value, setEmoji];
}
