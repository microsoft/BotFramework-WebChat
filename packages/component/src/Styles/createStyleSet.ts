import { normalizeStyleOptions, StyleOptions } from 'botframework-webchat-api';

import createActivitiesStyle from './StyleSet/Activities';
import createAudioAttachmentStyle from './StyleSet/AudioAttachment';
import createAudioContentStyle from './StyleSet/AudioContent';
import createAutoResizeTextAreaStyle from './StyleSet/AutoResizeTextArea';
import createAvatarStyle from './StyleSet/Avatar';
import createBasicTranscriptStyle from './StyleSet/BasicTranscript';
import createBubbleStyle from './StyleSet/Bubble';
import createCarouselFilmStrip from './StyleSet/CarouselFilmStrip';
import createCarouselFilmStripAttachment from './StyleSet/CarouselFilmStripAttachment';
import createCarouselFlipper from './StyleSet/CarouselFlipper';
import createConnectivityNotification from './StyleSet/ConnectivityNotification';
import createDictationInterimsStyle from './StyleSet/DictationInterims';
import createErrorBoxStyle from './StyleSet/ErrorBox';
import createErrorNotificationStyle from './StyleSet/ErrorNotification';
import createFileContentStyle from './StyleSet/FileContent';
import createImageAvatarStyle from './StyleSet/ImageAvatar';
import createInitialsAvatarStyle from './StyleSet/InitialsAvatar';
import createKeyboardHelpStyle from './StyleSet/KeyboardHelp';
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

// TODO: [P4] We should add a notice for people who want to use "styleSet" instead of "styleOptions".
//       "styleSet" is actually CSS stylesheet and it is based on the DOM tree.
//       DOM tree may change from time to time, thus, maintaining "styleSet" becomes a constant effort.

export default function createStyleSet(styleOptions: StyleOptions) {
  const strictStyleOptions = normalizeStyleOptions(styleOptions);

  return {
    activities: createActivitiesStyle(),
    audioAttachment: createAudioAttachmentStyle(strictStyleOptions),
    audioContent: createAudioContentStyle(),
    autoResizeTextArea: createAutoResizeTextAreaStyle(strictStyleOptions),
    avatar: createAvatarStyle(strictStyleOptions),
    basicTranscript: createBasicTranscriptStyle(strictStyleOptions),
    bubble: createBubbleStyle(strictStyleOptions),
    carouselFilmStrip: createCarouselFilmStrip(strictStyleOptions),
    carouselFilmStripAttachment: createCarouselFilmStripAttachment(strictStyleOptions),
    carouselFlipper: createCarouselFlipper(strictStyleOptions),
    connectivityNotification: createConnectivityNotification(strictStyleOptions),
    dictationInterims: createDictationInterimsStyle(strictStyleOptions),
    errorBox: createErrorBoxStyle(strictStyleOptions),
    errorNotification: createErrorNotificationStyle(strictStyleOptions),
    fileContent: createFileContentStyle(strictStyleOptions),
    imageAvatar: createImageAvatarStyle(strictStyleOptions),
    initialsAvatar: createInitialsAvatarStyle(strictStyleOptions),
    keyboardHelp: createKeyboardHelpStyle(strictStyleOptions),
    microphoneButton: createMicrophoneButtonStyle(strictStyleOptions),
    options: { ...strictStyleOptions }, // Cloned to make sure no additional modifications will propagate up.
    root: createRootStyle(strictStyleOptions),
    scrollToEndButton: createScrollToEndButtonStyle(strictStyleOptions),
    sendBox: createSendBoxStyle(strictStyleOptions),
    sendBoxButton: createSendBoxButtonStyle(strictStyleOptions),
    sendBoxTextBox: createSendBoxTextBoxStyle(strictStyleOptions),
    sendStatus: createSendStatusStyle(strictStyleOptions),
    singleAttachmentActivity: createSingleAttachmentActivityStyle(strictStyleOptions),
    spinnerAnimation: createSpinnerAnimationStyle(strictStyleOptions),
    stackedLayout: createStackedLayoutStyle(strictStyleOptions),
    suggestedAction: createSuggestedActionStyle(strictStyleOptions),
    suggestedActions: createSuggestedActionsStyle(strictStyleOptions),
    textContent: createTextContentStyle(strictStyleOptions),
    toast: createToastStyle(strictStyleOptions),
    toaster: createToasterStyle(strictStyleOptions),
    typingAnimation: createTypingAnimationStyle(strictStyleOptions),
    typingIndicator: createTypingIndicatorStyle(strictStyleOptions),
    uploadButton: createUploadButtonStyle(strictStyleOptions),
    videoAttachment: createVideoAttachmentStyle(),
    videoContent: createVideoContentStyle(strictStyleOptions),
    vimeoContent: createVimeoContentStyle(strictStyleOptions),
    warningNotification: createWarningNotificationStyle(strictStyleOptions),
    youTubeContent: createYouTubeContentStyle(strictStyleOptions)
  };
}
