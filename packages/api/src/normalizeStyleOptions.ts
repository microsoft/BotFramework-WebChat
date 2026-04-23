import { warnOnce } from '@msinternal/botframework-webchat-base/utils';

import defaultStyleOptions from './defaultStyleOptions';
import type { StrictStyleOptions, StyleOptions } from './StyleOptions';

const bubbleImageHeightDeprecation = warnOnce(
  '"styleOptions.bubbleImageHeight" has been deprecated. Use "styleOptions.bubbleImageMaxHeight" and "styleOptions.bubbleImageMinHeight" instead. This deprecation migration will be removed on or after 2026-07-05.'
);

const bubbleMaxWidthDeprecation = warnOnce(
  '"styleOptions.bubbleMaxWidth" has been deprecated. Use "styleOptions.bubbleAttachmentMaxWidth" and "styleOptions.bubbleMessageMaxWidth" instead. This deprecation migration will be removed on or after 2026-07-05.'
);

const bubbleMinWidthDeprecation = warnOnce(
  '"styleOptions.bubbleMinWidth" has been deprecated. Use "styleOptions.bubbleAttachmentMinWidth" and "styleOptions.bubbleMessageMinWidth" instead. This deprecation migration will be removed on or after 2026-07-05.'
);

// TODO: [P4] We should add a notice for people who want to use "styleSet" instead of "styleOptions".
//       "styleSet" is actually CSS stylesheet and it is based on the DOM tree.
//       DOM tree may change from time to time, thus, maintaining "styleSet" becomes a constant effort.

export default function normalizeStyleOptions({
  bubbleImageHeight,
  bubbleMaxWidth,
  bubbleMinWidth,
  hideUploadButton: _hideUploadButton,
  ...options
}: StyleOptions = {}): StrictStyleOptions {
  const filledOptions: Required<StyleOptions> = {
    ...defaultStyleOptions,
    bubbleImageHeight: undefined,
    bubbleMaxWidth: undefined,
    bubbleMinWidth: undefined,
    hideUploadButton: undefined,
    ...options
  };

  // Keep this list flat (no nested style) and serializable (no functions)
  const { bubbleFromUserNubOffset, bubbleNubOffset, emojiSet } = filledOptions;

  let normalizedBubbleFromUserNubOffset: number;
  let normalizedBubbleNubOffset: number;
  let normalizedEmojiSet: false | Record<string, string>;

  if (bubbleFromUserNubOffset === 'top') {
    normalizedBubbleFromUserNubOffset = 0;
  } else if (typeof bubbleFromUserNubOffset !== 'number') {
    normalizedBubbleFromUserNubOffset = -0;
  } else {
    normalizedBubbleFromUserNubOffset = bubbleFromUserNubOffset;
  }

  if (bubbleNubOffset === 'top') {
    normalizedBubbleNubOffset = 0;
  } else if (typeof bubbleNubOffset !== 'number') {
    normalizedBubbleNubOffset = -0;
  } else {
    normalizedBubbleNubOffset = bubbleNubOffset;
  }

  if (emojiSet === true) {
    normalizedEmojiSet = {
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
  } else if (Object.prototype.toString.call(emojiSet) !== '[object Object]') {
    console.warn('botframework-webchat: emojiSet must be a boolean or an object with emoticon: emojiValues');
    normalizedEmojiSet = false;
  } else {
    normalizedEmojiSet = emojiSet;
  }

  let patchedScrollToEndButtonBehavior = filledOptions.scrollToEndButtonBehavior;

  if (patchedScrollToEndButtonBehavior !== 'any' && patchedScrollToEndButtonBehavior !== false) {
    patchedScrollToEndButtonBehavior === 'unread' ||
      console.warn(
        'Web Chat: "scrollToEndButtonBehavior" must be either "unread", "any", or false, will set to "unread".'
      );

    patchedScrollToEndButtonBehavior = 'unread';
  }

  if (bubbleImageHeight) {
    bubbleImageHeightDeprecation();

    filledOptions.bubbleImageMaxHeight = bubbleImageHeight;
    filledOptions.bubbleImageMinHeight = bubbleImageHeight;

    filledOptions.bubbleImageHeight = undefined;
  }

  if (bubbleMaxWidth) {
    bubbleMaxWidthDeprecation();

    filledOptions.bubbleAttachmentMaxWidth = bubbleMaxWidth;
    filledOptions.bubbleMessageMaxWidth = bubbleMaxWidth;
  }

  if (bubbleMinWidth) {
    bubbleMinWidthDeprecation();

    filledOptions.bubbleAttachmentMinWidth = bubbleMinWidth;
    filledOptions.bubbleMessageMinWidth = bubbleMinWidth;
  }

  return {
    ...filledOptions,
    bubbleFromUserNubOffset: normalizedBubbleFromUserNubOffset,
    bubbleNubOffset: normalizedBubbleNubOffset,
    emojiSet: normalizedEmojiSet,
    scrollToEndButtonBehavior: patchedScrollToEndButtonBehavior
  };
}
