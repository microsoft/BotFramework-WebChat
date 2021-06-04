import defaultStyleOptions from './defaultStyleOptions';
import StyleOptions, { StrictStyleOptions } from './StyleOptions';
import warnOnce from './utils/warnOnce';

const hideScrollToEndButtonDeprecation = warnOnce(
  '"styleOptions.hideScrollToEndButton" has been deprecated. To hide scroll to end button, set "scrollToEndBehavior" to false. This deprecation migration will be removed on or after 2023-06-02.'
);

const newMessagesButtonFontSizeDeprecation = warnOnce(
  '"styleOptions.newMessagesButtonFontSize" has been renamed to "styleOptions.scrollToEndButtonFontSize". This deprecation migration will be removed on or after 2023-06-02.'
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

  return {
    ...filledOptions,
    bubbleFromUserNubOffset: normalizedBubbleFromUserNubOffset,
    bubbleNubOffset: normalizedBubbleNubOffset,
    emojiSet: normalizedEmojiSet,
    scrollToEndButtonBehavior: patchedScrollToEndButtonBehavior
  };
}
