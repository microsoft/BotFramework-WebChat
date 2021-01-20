/* eslint-disable complexity */
import createActivitiesStyle from './StyleSet/Activities';
import createActivityStyle from './StyleSet/Activity';
import createAudioAttachmentStyle from './StyleSet/AudioAttachment';
import createAudioContentStyle from './StyleSet/AudioContent';
import createAutoResizeTextAreaStyle from './StyleSet/AutoResizeTextArea';
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
import createSendBoxTextBoxStyle from './StyleSet/SendBoxTextBox';
import createSendStatusStyle from './StyleSet/SendStatus';
import createSingleAttachmentActivityStyle from './StyleSet/SingleAttachmentActivity';
import createSpinnerAnimationStyle from './StyleSet/SpinnerAnimation';
import createStackedLayoutStyle from './StyleSet/StackedLayout';
import createSuggestedActionsStyle from './StyleSet/SuggestedActions';
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

export default function createStyleSet(options) {
  options = { ...defaultStyleOptions, ...options };

  // Keep this list flat (no nested style) and serializable (no functions)

  // TODO: [P4] Deprecate this code after bump to v5
  const { bubbleFromUserNubOffset, bubbleNubOffset } = options;

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
    autoResizeTextArea: createAutoResizeTextAreaStyle(options),
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
    options: { ...options }, // Cloned to make sure no additional modifications will propagate up.
    root: createRootStyle(options),
    scrollToEndButton: createScrollToEndButtonStyle(options),
    sendBox: createSendBoxStyle(options),
    sendBoxButton: createSendBoxButtonStyle(options),
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
