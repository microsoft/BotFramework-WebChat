import defaultStyleOptions from './defaultStyleOptions';
import StyleOptions, { StrictStyleOptions } from './StyleOptions';

// TODO: [P4] We should add a notice for people who want to use "styleSet" instead of "styleOptions".
//       "styleSet" is actually CSS stylesheet and it is based on the DOM tree.
//       DOM tree may change from time to time, thus, maintaining "styleSet" becomes a constant effort.

// eslint-disable-next-line complexity
export default function normalizeStyleOptions(options: StyleOptions = {}): StrictStyleOptions {
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

  return {
    ...filledOptions,
    bubbleFromUserNubOffset: normalizedBubbleFromUserNubOffset,
    bubbleNubOffset: normalizedBubbleNubOffset,
    emojiSet: normalizedEmojiSet
  };
}
