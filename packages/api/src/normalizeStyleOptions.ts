import { warnOnce } from 'botframework-webchat-core';

import defaultStyleOptions from './defaultStyleOptions';
import StyleOptions, { StrictStyleOptions } from './StyleOptions';

const hideScrollToEndButtonDeprecation = warnOnce(
  '"styleOptions.hideScrollToEndButton" has been deprecated. To hide scroll to end button, set "scrollToEndBehavior" to false. This deprecation migration will be removed on or after 2023-06-02.'
);

const newMessagesButtonFontSizeDeprecation = warnOnce(
  '"styleOptions.newMessagesButtonFontSize" has been renamed to "styleOptions.scrollToEndButtonFontSize". This deprecation migration will be removed on or after 2023-06-02.'
);

const suggestedActionBackgroundDeprecation = warnOnce(
  '"styleOptions.suggestedActionBackground" has been deprecated. Please use "styleOptions.suggestedActionBackgroundColor" instead. This deprecation migration will be removed on or after 2021-09-16.'
);

const suggestedActionXXXBackgroundDeprecation = warnOnce(
  '"styleOptions.suggestedActionXXXBackground" has been deprecated. Please use "styleOptions.suggestedActionBackgroundColorOnXXX" instead. This deprecation migration will be removed on or after 2021-09-16.'
);

const suggestedActionDisabledDeprecation = warnOnce(
  '"styleOptions.suggestedActionDisabledXXX" has been renamed to "styleOptions.suggestedActionXXXOnDisabled". This deprecation migration will be removed on or after 2021-09-16.'
);

// TODO: [P4] We should add a notice for people who want to use "styleSet" instead of "styleOptions".
//       "styleSet" is actually CSS stylesheet and it is based on the DOM tree.
//       DOM tree may change from time to time, thus, maintaining "styleSet" becomes a constant effort.

// eslint-disable-next-line complexity
export default function normalizeStyleOptions({
  hideScrollToEndButton,
  newMessagesButtonFontSize,
  ...options
}: StyleOptions = {}): StrictStyleOptions {
  const filledOptions: Required<StyleOptions> = { ...defaultStyleOptions, ...options };

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

  if (hideScrollToEndButton) {
    hideScrollToEndButtonDeprecation();

    // Only set if the "scrollToEndButtonBehavior" is not set.
    // If it has been set, the developer should know the older "hideScrollToEndButton" option is deprecated.
    filledOptions.scrollToEndButtonBehavior = options.scrollToEndButtonBehavior || false;
  }

  let patchedScrollToEndButtonBehavior = filledOptions.scrollToEndButtonBehavior;

  if (patchedScrollToEndButtonBehavior !== 'any' && patchedScrollToEndButtonBehavior !== false) {
    patchedScrollToEndButtonBehavior === 'unread' ||
      console.warn(
        'Web Chat: "scrollToEndButtonBehavior" must be either "unread", "any", or false, will set to "unread".'
      );

    patchedScrollToEndButtonBehavior = 'unread';
  }

  if (newMessagesButtonFontSize) {
    newMessagesButtonFontSizeDeprecation();

    // Only set if the "scrollToEndButtonFontSize" is not set.
    filledOptions.scrollToEndButtonFontSize = options.scrollToEndButtonFontSize || newMessagesButtonFontSize;
  }

  options.suggestedActionBackground && suggestedActionBackgroundDeprecation();

  if (options.suggestedActionActiveBackground) {
    suggestedActionXXXBackgroundDeprecation();

    filledOptions.suggestedActionBackgroundColorOnActive =
      options.suggestedActionBackgroundColorOnActive || options.suggestedActionActiveBackground;
  }

  if (options.suggestedActionFocusBackground) {
    suggestedActionXXXBackgroundDeprecation();

    filledOptions.suggestedActionBackgroundColorOnFocus =
      options.suggestedActionBackgroundColorOnFocus || options.suggestedActionFocusBackground;
  }

  if (options.suggestedActionHoverBackground) {
    suggestedActionXXXBackgroundDeprecation();

    filledOptions.suggestedActionBackgroundColorOnHover =
      options.suggestedActionBackgroundColorOnHover || options.suggestedActionHoverBackground;
  }

  if (options.suggestedActionDisabledBackground) {
    suggestedActionXXXBackgroundDeprecation();

    filledOptions.suggestedActionBackgroundColorOnDisabled =
      options.suggestedActionBackgroundColorOnDisabled || options.suggestedActionDisabledBackground;
  }

  if (options.suggestedActionDisabledBorderColor) {
    suggestedActionDisabledDeprecation();

    filledOptions.suggestedActionBorderColorOnDisabled =
      options.suggestedActionBorderColorOnDisabled || options.suggestedActionDisabledBorderColor;
  }

  if (options.suggestedActionDisabledBorderStyle) {
    suggestedActionDisabledDeprecation();

    filledOptions.suggestedActionBorderStyleOnDisabled =
      options.suggestedActionBorderStyleOnDisabled || options.suggestedActionDisabledBorderStyle;
  }

  if (options.suggestedActionDisabledBorderWidth) {
    suggestedActionDisabledDeprecation();

    filledOptions.suggestedActionBorderWidthOnDisabled =
      options.suggestedActionBorderWidthOnDisabled || options.suggestedActionDisabledBorderWidth;
  }

  if (options.suggestedActionDisabledTextColor) {
    suggestedActionDisabledDeprecation();

    filledOptions.suggestedActionTextColorOnDisabled =
      options.suggestedActionTextColorOnDisabled || options.suggestedActionDisabledTextColor;
  }

  return {
    ...filledOptions,
    bubbleFromUserNubOffset: normalizedBubbleFromUserNubOffset,
    bubbleNubOffset: normalizedBubbleNubOffset,
    emojiSet: normalizedEmojiSet,
    scrollToEndButtonBehavior: patchedScrollToEndButtonBehavior
  };
}
