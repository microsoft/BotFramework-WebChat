import defaultStyleOptions from './defaultStyleOptions';

// TODO: [P4] We should add a notice for people who want to use "styleSet" instead of "styleOptions".
//       "styleSet" is actually CSS stylesheet and it is based on the DOM tree.
//       DOM tree may change from time to time, thus, maintaining "styleSet" becomes a constant effort.

// eslint-disable-next-line complexity
export default function patchStyleOptions(
  options,
  { groupTimestamp: groupTimestampFromProps, sendTimeout: sendTimeoutFromProps }
) {
  const patchedOptions = { ...defaultStyleOptions, ...options };

  // Keep this list flat (no nested style) and serializable (no functions)

  // TODO: [P4] Deprecate this code after bump to v5
  const { bubbleFromUserNubOffset, bubbleNubOffset, emojiSet } = patchedOptions;

  if (bubbleFromUserNubOffset === 'top') {
    patchedOptions.bubbleFromUserNubOffset = 0;
  } else if (typeof bubbleFromUserNubOffset !== 'number') {
    patchedOptions.bubbleFromUserNubOffset = -0;
  }

  if (bubbleNubOffset === 'top') {
    patchedOptions.bubbleNubOffset = 0;
  } else if (typeof bubbleNubOffset !== 'number') {
    patchedOptions.bubbleNubOffset = -0;
  }

  if (emojiSet === true) {
    patchedOptions.emojiSet = {
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
  } else if (Object.prototype.toString.call(patchedOptions.emojiSet) !== '[object Object]') {
    console.warn('botframework-webchat: emojiSet must be a boolean or an object with emoticon: emojiValues');
    patchedOptions.emojiSet = false;
  }

  if (typeof groupTimestampFromProps !== 'undefined' && typeof options.groupTimestamp === 'undefined') {
    console.warn(
      'Web Chat: "groupTimestamp" has been moved to "styleOptions". This deprecation migration will be removed on or after January 1 2022.'
    );

    patchedOptions.groupTimestamp = groupTimestampFromProps;
  }

  if (typeof sendTimeoutFromProps !== 'undefined' && typeof options.sendTimeout === 'undefined') {
    console.warn(
      'Web Chat: "sendTimeout" has been moved to "styleOptions". This deprecation migration will be removed on or after January 1 2022.'
    );

    patchedOptions.sendTimeout = sendTimeoutFromProps;
  }

  if (patchedOptions.slowConnectionAfter < 0) {
    console.warn('Web Chat: "slowConnectionAfter" cannot be negative, will set to 0.');

    patchedOptions.slowConnectionAfter = 0;
  }

  return patchedOptions;
}
