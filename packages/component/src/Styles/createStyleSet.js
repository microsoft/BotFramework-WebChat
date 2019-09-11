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
import createDownloadAttachmentStyle from './StyleSet/DownloadAttachment';
import createErrorBoxStyle from './StyleSet/ErrorBox';
import createErrorNotificationStyle from './StyleSet/ErrorNotification';
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
import createTimestampStyle from './StyleSet/Timestamp';
import createTypingAnimationStyle from './StyleSet/TypingAnimation';
import createTypingIndicatorStyle from './StyleSet/TypingIndicator';
import createUploadAttachmentStyle from './StyleSet/UploadAttachment';
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
  const { bubbleBorder, bubbleFromUserBorder, suggestedActionBorder, suggestedActionDisabledBorder } = options;

  if (bubbleBorder) {
    console.warn(
      'Web Chat: styleSet.bubbleBorder is being deprecated. Please use bubbleBorderColor, bubbleBorderStyle, and, bubbleBorderWidth.'
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
      'Web Chat: styleSet.bubbleFromUserBorder is being deprecated. Please use bubbleFromUserBorderColor, bubbleFromUserBorderStyle, and, bubbleFromUserBorderWidth.'
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
      'Web Chat: styleSet.suggestedActionBorder is being deprecated. Please use suggestedActionBorderColor, suggestedActionBorderStyle, and, suggestedActionBorderWidth.'
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
      'Web Chat: styleSet.suggestedActionDisabledBorder is being deprecated. Please use suggestedActionDisabledBorderColor, suggestedActionDisabledBorderStyle, and, suggestedActionDisabledBorderWidth.'
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
    downloadAttachment: createDownloadAttachmentStyle(options),
    errorBox: createErrorBoxStyle(options),
    errorNotification: createErrorNotificationStyle(options),
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
    timestamp: createTimestampStyle(options),
    typingAnimation: createTypingAnimationStyle(options),
    typingIndicator: createTypingIndicatorStyle(options),
    uploadAttachment: createUploadAttachmentStyle(options),
    uploadButton: createUploadButtonStyle(options),
    videoAttachment: createVideoAttachmentStyle(options),
    videoContent: createVideoContentStyle(options),
    vimeoContent: createVimeoContentStyle(options),
    warningNotification: createWarningNotificationStyle(options),
    youTubeContent: createYouTubeContentStyle(options)
  };
}
