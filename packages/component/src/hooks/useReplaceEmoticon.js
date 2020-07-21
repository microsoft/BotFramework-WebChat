/*eslint require-unicode-regexp: "off" */

import { useCallback } from 'react';

import useStyleOptions from './useStyleOptions';

function escapeRegexp(emoticon) {
  return emoticon.replace(/[\\^$*+?.()|[\]{}]/gu, '\\$&');
}

export default function useReplaceEmoticon() {
  const [{ emojiSet }] = useStyleOptions();
  return useCallback(
    valueWithEmoticon => {
      const escapedString =
        Object.prototype.toString.call(emojiSet) !== '[object Object]' &&
        Object.keys(emojiSet)
          .sort()
          .map(escapeRegexp)
          .join('|');
      const emojiRegExp =
        Object.prototype.toString.call(emojiSet) !== '[object Object]'
          ? new RegExp(escapedString, 'gmu')
          : new RegExp(/([()-/03:<DOP\\op|]{2,3})/gmu);

      const emoticon = valueWithEmoticon.match(emojiRegExp);
      let valueWithEmoji = valueWithEmoticon;

      if (!!emojiSet && emoticon && emojiSet[emoticon]) {
        valueWithEmoji = valueWithEmoticon.replace(emoticon, emojiSet[emoticon]);
      }
      return valueWithEmoji;
    },
    [emojiSet]
  );
}
