/* eslint-disable complexity */
import createActivitiesStyle from './StyleSet/Activities';
import createActivityStyle from './StyleSet/Activity';
import createAudioAttachmentStyle from './StyleSet/AudioAttachment';
import createAudioContentStyle from './StyleSet/AudioContent';
import createAvatarStyle from './StyleSet/Avatar';
import createBubbleStyle from './StyleSet/Bubble';
import createCarouselFilmStrip from './StyleSet/CarouselFilmStrip';
import createCarouselFlipper from './StyleSet/CarouselFlipper';
import createConnectivityNotification from './StyleSet/ConnectivityNotification';
import createDictationInterimsStyle from './StyleSet/DictationInterims';
import createErrorBoxStyle from './StyleSet/ErrorBox';
import createErrorNotificationStyle from './StyleSet/ErrorNotification';
import createFileContentStyle from './StyleSet/FileContent';
import createImageAvatarStyle from './StyleSet/ImageAvatar';
import createInitialsAvatarStyle from './StyleSet/InitialsAvatar';
import createMicrophoneButtonStyle from './StyleSet/MicrophoneButton';
import createRootStyle from './StyleSet/Root';
import createScrollToEndButtonStyle from './StyleSet/ScrollToEndButton';
import createSendBoxButtonStyle from './StyleSet/SendBoxButton';
import createSendBoxStyle from './StyleSet/SendBox';
import createSendBoxTextAreaStyle from './StyleSet/SendBoxTextArea';
import createSendBoxTextBoxStyle from './StyleSet/SendBoxTextBox';
import createSendStatusStyle from './StyleSet/SendStatus';
import createSingleAttachmentActivityStyle from './StyleSet/SingleAttachmentActivity';
import createSpinnerAnimationStyle from './StyleSet/SpinnerAnimation';
import createStackedLayoutStyle from './StyleSet/StackedLayout';
import createSuggestedActionsStyle from './StyleSet/SuggestedActions';
import createSuggestedActionsStyleSet from './StyleSet/SuggestedActionsStyleSet';
import createSuggestedActionStyle from './StyleSet/SuggestedAction';
import createTextContentStyle from './StyleSet/TextContent';
import createToasterStyle from './StyleSet/Toaster';
import createToastStyle from './StyleSet/Toast';
import createTypingAnimationStyle from './StyleSet/TypingAnimation';
import createTypingIndicatorStyle from './StyleSet/TypingIndicator';
import createUploadButtonStyle from './StyleSet/UploadButton';
import createVideoAttachmentStyle from './StyleSet/VideoAttachment';
import createVideoContentStyle from './StyleSet/VideoContent';
import createVimeoContentStyle from './StyleSet/VimeoContent';
import createWarningNotificationStyle from './StyleSet/WarningNotification';
import createYouTubeContentStyle from './StyleSet/YouTubeContent';

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

export default function createStyleSet(options) {
  options = { ...defaultStyleOptions, ...options };

  // Keep this list flat (no nested style) and serializable (no functions)

  // TODO: [P4] Deprecate this code after bump to v5
  const {
    bubbleBorder,
    bubbleFromUserBorder,
    bubbleFromUserNubOffset,
    bubbleNubOffset,
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

  if (options.emojiSet === true) {
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

  return {
    activities: createActivitiesStyle(options),
    activity: createActivityStyle(options),
    audioAttachment: createAudioAttachmentStyle(options),
    audioContent: createAudioContentStyle(options),
    avatar: createAvatarStyle(options),
    bubble: createBubbleStyle(options),
    carouselFilmStrip: createCarouselFilmStrip(options),
    carouselFlipper: createCarouselFlipper(options),
    connectivityNotification: createConnectivityNotification(options),
    dictationInterims: createDictationInterimsStyle(options),
    errorBox: createErrorBoxStyle(options),
    errorNotification: createErrorNotificationStyle(options),
    fileContent: createFileContentStyle(options),
    imageAvatar: createImageAvatarStyle(options),
    initialsAvatar: createInitialsAvatarStyle(options),
    microphoneButton: createMicrophoneButtonStyle(options),
    options: {
      ...options,
      suggestedActionsStyleSet: createSuggestedActionsStyleSet(options)
    },
    root: createRootStyle(options),
    scrollToEndButton: createScrollToEndButtonStyle(options),
    sendBox: createSendBoxStyle(options),
    sendBoxButton: createSendBoxButtonStyle(options),
    sendBoxTextArea: createSendBoxTextAreaStyle(options),
    sendBoxTextBox: createSendBoxTextBoxStyle(options),
    sendStatus: createSendStatusStyle(options),
    singleAttachmentActivity: createSingleAttachmentActivityStyle(options),
    spinnerAnimation: createSpinnerAnimationStyle(options),
    stackedLayout: createStackedLayoutStyle(options),
    suggestedAction: createSuggestedActionStyle(options),
    suggestedActions: createSuggestedActionsStyle(options),
    textContent: createTextContentStyle(options),
    toast: createToastStyle(options),
    toaster: createToasterStyle(options),
    typingAnimation: createTypingAnimationStyle(options),
    typingIndicator: createTypingIndicatorStyle(options),
    uploadButton: createUploadButtonStyle(options),
    videoAttachment: createVideoAttachmentStyle(options),
    videoContent: createVideoContentStyle(options),
    vimeoContent: createVimeoContentStyle(options),
    warningNotification: createWarningNotificationStyle(options),
    youTubeContent: createYouTubeContentStyle(options)
  };
}
