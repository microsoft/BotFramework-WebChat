/*eslint require-unicode-regexp: "off" */

import { useCallback } from 'react';

import useStyleOptions from '../useStyleOptions';

export default function useReplaceEmoticon() {
  const [{ emojiSet }] = useStyleOptions();

  return useCallback(
    ({ selectionStart, value: nextValue }) => {
      let emojiChange = selectionStart;

      Object.entries(emojiSet).every(([emoticon, emoji]) => {
        const { length } = emoticon;
        if (
          nextValue.slice(selectionStart - length, selectionStart - 1) === emoticon.slice(0, length - 1) &&
          nextValue[selectionStart - 1] === emoticon[length - 1]
        ) {
          // emojiChange = `${nextValue.slice(0, selectionStart - length)}${emoji}`.length;
          emojiChange = selectionStart - length + emoji.length;

          nextValue = `${nextValue.slice(0, selectionStart - length)}${emoji}${nextValue.slice(selectionStart)}`;

          return false;
        }

        return true;
      });

      return { emojiChange, valueWithEmoji: nextValue };
    },
    [emojiSet]
  );
}
