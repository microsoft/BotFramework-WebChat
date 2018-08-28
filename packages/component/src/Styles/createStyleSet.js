import createActivitiesStyle from './StyleSet/Activities';
import createActivityStyle from './StyleSet/Activity';
import createAnimationCardAttachmentStyle from './StyleSet/AnimationCardAttachment';
import createAudioAttachmentStyle from './StyleSet/AudioAttachment';
import createAudioCardAttachmentStyle from './StyleSet/AudioCardAttachment';
import createAudioContentStyle from './StyleSet/AudioContent';
import createAvatarStyle from './StyleSet/Avatar';
import createBubbleStyle from './StyleSet/Bubble';
import createBubble2Style from './StyleSet/Bubble2';
import createMicrophoneButtonStyle from './StyleSet/MicrophoneButton';
import createMultipleAttachmentActivityStyle from './StyleSet/MultipleAttachmentActivity';
import createRootStyle from './StyleSet/Root';
import createSendBoxStyle from './StyleSet/SendBox';
import createSendBoxTextBoxStyle from './StyleSet/SendBoxTextBox';
import createSingleAttachmentActivityStyle from './StyleSet/SingleAttachmentActivity';
import createSuggestedActionsStyle from './StyleSet/SuggestedActions';
import createSuggestedActionsStyleSet from './StyleSet/SuggestedActionsStyleSet';
import createSuggestedActionStyle from './StyleSet/SuggestedAction';
import createTextContentStyle from './StyleSet/TextContent';
import createTimestampStyle from './StyleSet/Timestamp';
import createUnknownAttachmentStyle from './StyleSet/UnknownAttachment';
import createUploadButtonStyle from './StyleSet/UploadButton';
import createVideoAttachmentStyle from './StyleSet/VideoAttachment';
import createVideoContentStyle from './StyleSet/VideoContent';
import createVimeoContentStyle from './StyleSet/VimeoContent';
import createYouTubeContentStyle from './StyleSet/YouTubeContent';

const DEFAULT_OPTIONS = {
  accent: '#69F',
  avatarSize: 40,

  backgroundColor: '#EEE',

  bubbleBackground: 'White',
  bubbleImageHeight: 240,
  bubbleMaxWidth: 480, // screen width = 600px
  bubbleMinWidth: 250, // min screen width = 300px, Edge requires 372px (https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/13621468/)

  scrollToBottomThreshold: 40,
  sendBoxHeight: 50,

  timestampColor: 'rgba(0, 0, 0, .2)'
};

export default function createStyleSet(options = DEFAULT_OPTIONS) {
  return {
    activity: createActivityStyle(options),
    activities: createActivitiesStyle(options),
    animationCardAttachment: createAnimationCardAttachmentStyle(options),
    audioAttachment: createAudioAttachmentStyle(options),
    audioCardAttachment: createAudioCardAttachmentStyle(options),
    audioContent: createAudioContentStyle(options),
    avatar: createAvatarStyle(options),
    bubble: createBubbleStyle(options),
    bubble2: createBubble2Style(options),
    microphoneButton: createMicrophoneButtonStyle(options),
    multipleAttachmentActivity: createMultipleAttachmentActivityStyle(options),
    options: {
      ...options,
      suggestedActionsStyleSet: createSuggestedActionsStyleSet(options)
    },
    root: createRootStyle(options),
    sendBox: createSendBoxStyle(options),
    sendBoxTextBox: createSendBoxTextBoxStyle(options),
    singleAttachmentActivity: createSingleAttachmentActivityStyle(options),
    suggestedAction: createSuggestedActionStyle(options),
    suggestedActions: createSuggestedActionsStyle(options),
    textContent: createTextContentStyle(options),
    timestamp: createTimestampStyle(options),
    unknownAttachment: createUnknownAttachmentStyle(options),
    uploadButton: createUploadButtonStyle(options),
    videoAttachment: createVideoAttachmentStyle(options),
    videoContent: createVideoContentStyle(options),
    vimeoContent: createVimeoContentStyle(options),
    youTubeContent: createYouTubeContentStyle(options)
  };
}
