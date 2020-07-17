import useEmojiFromStyles from './useEmojiFromStyles';
import { useTextBoxValue } from '../SendBox/TextBox';
import { useCallback } from 'react';

export default function useReplaceEmoticon() {
  const [{ emojiAutocorrect, emojiUnicodeMap, emojiRegExp }] = useEmojiFromStyles();
  const [value] = useTextBoxValue();
  const setEmoji = useCallback(
    value => {
      const emoticon = value.match(emojiRegExp);

      if (emojiAutocorrect && emoticon && emojiUnicodeMap[emoticon]) {
        value = value.replace(emoticon, emojiUnicodeMap[emoticon]);
      }

      return value;
    },
    [emojiAutocorrect, emojiUnicodeMap, emojiRegExp]
  );

  return [value, setEmoji];
}
