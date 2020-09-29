import defaultStyleOptions from './defaultStyleOptions';

// TODO: [P4] We should add a notice for people who want to use "styleSet" instead of "styleOptions".
//       "styleSet" is actually CSS stylesheet and it is based on the DOM tree.
//       DOM tree may change from time to time, thus, maintaining "styleSet" becomes a constant effort.

function parseBorder(border) {
  const dummyElement = document.createElement('div');

  dummyElement.setAttribute('style', `border: ${border}`);

  const {
    style: { borderColor: color, borderStyle: style, borderWidth: width }
  } = dummyElement;

  return {
    color,
    style,
    width
  };
}

const PIXEL_UNIT_PATTERN = /^\d+px$/u;

export default function patchStyleOptions(
  options,
  { groupTimestamp: groupTimestampFromProps, sendTimeout: sendTimeoutFromProps }
) {
  options = { ...defaultStyleOptions, ...options };

  // Keep this list flat (no nested style) and serializable (no functions)

  // TODO: [P4] Deprecate this code after bump to v5
  const {
    bubbleBorder,
    bubbleFromUserBorder,
    bubbleFromUserNubOffset,
    bubbleNubOffset,
    emojiSet,
    groupTimestamp,
    sendTimeout,
    suggestedActionBorder,
    suggestedActionDisabledBorder
  } = options;

  if (bubbleBorder) {
    console.warn(
      'botframework-webchat: "styleSet.bubbleBorder" is deprecated and will be removed on or after 2020-07-17. Please use "bubbleBorderColor", "bubbleBorderStyle", and, "bubbleBorderWidth.'
    );

    const { color, style, width } = parseBorder(bubbleBorder);

    if (color && color !== 'initial') {
      options.bubbleBorderColor = color;
    }

    if (style && style !== 'initial') {
      options.bubbleBorderStyle = style;
    }

    if (PIXEL_UNIT_PATTERN.test(width)) {
      options.bubbleBorderWidth = parseInt(width, 10);
    }
  }

  if (bubbleFromUserBorder) {
    console.warn(
      'botframework-webchat: "styleSet.bubbleFromUserBorder" is deprecated and will be removed on or after 2020-07-17. Please use "bubbleFromUserBorderColor", "bubbleFromUserBorderStyle", and, "bubbleFromUserBorderWidth".'
    );

    const { color, style, width } = parseBorder(bubbleFromUserBorder);

    if (color && color !== 'initial') {
      options.bubbleFromUserBorderColor = color;
    }

    if (style && style !== 'initial') {
      options.bubbleFromUserBorderStyle = style;
    }

    if (PIXEL_UNIT_PATTERN.test(width)) {
      options.bubbleFromUserBorderWidth = parseInt(width, 10);
    }
  }

  if (suggestedActionBorder) {
    console.warn(
      'botframework-webchat: "styleSet.suggestedActionBorder" is deprecated and will be removed on or after 2020-09-11. Please use "suggestedActionBorderColor", "suggestedActionBorderStyle", and, "suggestedActionBorderWidth".'
    );

    const { color, style, width } = parseBorder(suggestedActionBorder);

    if (color && color !== 'initial') {
      options.suggestedActionBorderColor = color;
    }

    if (style && style !== 'initial') {
      options.suggestedActionBorderStyle = style;
    }

    if (PIXEL_UNIT_PATTERN.test(width)) {
      options.suggestedActionBorderWidth = parseInt(width, 10);
    }
  }

  if (suggestedActionDisabledBorder) {
    console.warn(
      'botframework-webcaht: "styleSet.suggestedActionDisabledBorder" is deprecated and will be removed on or after 2020-09-11. Please use "suggestedActionDisabledBorderColor", "suggestedActionDisabledBorderStyle", and, "suggestedActionDisabledBorderWidth".'
    );

    const { color, style, width } = parseBorder(suggestedActionDisabledBorder);

    if (color && color !== 'initial') {
      options.suggestedActionDisabledBorderColor = color;
    }

    if (style && style !== 'initial') {
      options.suggestedActionDisabledBorderStyle = style;
    }

    if (PIXEL_UNIT_PATTERN.test(width)) {
      options.suggestedActionDisabledBorderWidth = parseInt(width, 10);
    }
  }

  if (bubbleFromUserNubOffset === 'top') {
    options.bubbleFromUserNubOffset = 0;
  } else if (typeof bubbleFromUserNubOffset !== 'number') {
    options.bubbleFromUserNubOffset = -0;
  }

  if (bubbleNubOffset === 'top') {
    options.bubbleNubOffset = 0;
  } else if (typeof bubbleNubOffset !== 'number') {
    options.bubbleNubOffset = -0;
  }

  if (emojiSet === true) {
    options.emojiSet = {
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
  } else if (Object.prototype.toString.call(options.emojiSet) !== '[object Object]') {
    console.warn('botframework-webchat: emojiSet must be a boolean or an object with emoticon: emojiValues');
    options.emojiSet = false;
  }

  if (typeof groupTimestampFromProps !== 'undefined' && typeof groupTimestamp === 'undefined') {
    console.warn(
      'Web Chat: "groupTimestamp" has been moved to "styleOptions". This deprecation migration will be removed on or after January 1 2022.'
    );

    options.groupTimestamp = groupTimestampFromProps;
  }

  if (typeof sendTimeoutFromProps !== 'undefined' && typeof sendTimeout === 'undefined') {
    console.warn(
      'Web Chat: "sendTimeout" has been moved to "styleOptions". This deprecation migration will be removed on or after January 1 2022.'
    );

    options.sendTimeout = sendTimeoutFromProps;
  }

  if (options.slowConnectionAfter < 0) {
    console.warn('Web Chat: "slowConnectionAfter" cannot be negative, will set to 0.');

    options.slowConnectionAfter = 0;
  }

  return options;
}
