/*eslint require-unicode-regexp: "off" */

import { useCallback } from 'react';

import escapeRegexp from '../Utils/escapeRegexp';
import useStyleOptions from './useStyleOptions';

export default function useReplaceEmoticon() {
  const [{ emojiSet }] = useStyleOptions();

  return useCallback(
    valueWithEmoticon => {
      const escapedEmoticonRegExp =
        Object.prototype.toString.call(emojiSet) === '[object Object]' &&
        Object.keys(emojiSet)
          .sort()
          .map(escapeRegexp)
          .join('|');

      const emojiRegExp =
        Object.prototype.toString.call(emojiSet) === '[object Object]'
          ? new RegExp(escapedEmoticonRegExp, 'gmu')
          : /([()-/03:;<DOP\\op|]{2,3})/gmu;

      const emoticonMatches = valueWithEmoticon.match(emojiRegExp);

      let valueWithEmoji = valueWithEmoticon;

      if (!!emojiSet && emoticonMatches) {
        emoticonMatches.forEach(emoticon => {
          const escapeString = escapeRegexp('\\' + emoticon);
          const emoticonEscapeStringRegExp = new RegExp(escapeString, 'gm');

          const needEscape = emoticonEscapeStringRegExp.test(valueWithEmoticon);

          if (needEscape) {
            const splitEmoticon = emoticon.split('').join('\\');
            valueWithEmoji = valueWithEmoticon.replace(emoticon, splitEmoticon);
          }

          if (emojiSet[emoticon]) {
            valueWithEmoji = valueWithEmoji.replace(emoticon, emojiSet[emoticon]);
          }
        });
      }
      return valueWithEmoji;
    },
    [emojiSet]
  );
}
