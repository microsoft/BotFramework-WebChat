import useEmojiFromStyles from './useEmojiFromStyles';
import { useTextBoxValue } from '../SendBox/TextBox';
import { useCallback } from 'react';

export default function useRenderEmoji() {
  const [{ emojiAutocorrect, emojiUnicodeMap, emojiRegexp }] = useEmojiFromStyles();

  const [value] = useTextBoxValue();

  const setEmoji = useCallback(
    value => {
      const emoticon = value.match(emojiRegexp);

      if (emojiAutocorrect && !!emoticon && !!emojiUnicodeMap[emoticon]) {
        value = value.replace(emoticon, emojiUnicodeMap[emoticon]);
      }
      return value;
    },
    [emojiAutocorrect, emojiUnicodeMap, emojiRegexp]
  );

  return [value, setEmoji];
}
