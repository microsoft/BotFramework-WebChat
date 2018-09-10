import createActivitiesStyle from './StyleSet/Activities';
import createActivityStyle from './StyleSet/Activity';
import createAdaptiveCardRendererStyle from './StyleSet/AdaptiveCardRenderer';
import createAnimationCardAttachmentStyle from './StyleSet/AnimationCardAttachment';
import createAudioAttachmentStyle from './StyleSet/AudioAttachment';
import createAudioCardAttachmentStyle from './StyleSet/AudioCardAttachment';
import createAudioContentStyle from './StyleSet/AudioContent';
import createAvatarStyle from './StyleSet/Avatar';
import createBubbleStyle from './StyleSet/Bubble';
import createCarouselFilmStrip from './StyleSet/CarouselFilmStrip';
import createDownloadAttachmentStyle from './StyleSet/DownloadAttachment';
import createErrorBoxStyle from './StyleSet/ErrorBox';
import createMicrophoneButtonStyle from './StyleSet/MicrophoneButton';
import createRootStyle from './StyleSet/Root';
import createSendBoxStyle from './StyleSet/SendBox';
import createSendBoxTextBoxStyle from './StyleSet/SendBoxTextBox';
import createSingleAttachmentActivityStyle from './StyleSet/SingleAttachmentActivity';
import createStackedLayoutStyle from './StyleSet/StackedLayout';
import createSuggestedActionsStyle from './StyleSet/SuggestedActions';
import createSuggestedActionsStyleSet from './StyleSet/SuggestedActionsStyleSet';
import createSuggestedActionStyle from './StyleSet/SuggestedAction';
import createTextContentStyle from './StyleSet/TextContent';
import createTimestampStyle from './StyleSet/Timestamp';
import createTypingActivityStyle from './StyleSet/TypingActivity';
import createUploadButtonStyle from './StyleSet/UploadButton';
import createVideoAttachmentStyle from './StyleSet/VideoAttachment';
import createVideoContentStyle from './StyleSet/VideoContent';
import createVimeoContentStyle from './StyleSet/VimeoContent';
import createYouTubeContentStyle from './StyleSet/YouTubeContent';

import defaultStyleSetOptions from './defaultStyleSetOptions';

export default function createStyleSet(options = defaultStyleSetOptions) {
  // Keep this list flat (no nested style) and serializable (no functions)

  return {
    activity: createActivityStyle(options),
    activities: createActivitiesStyle(options),
    adaptiveCardRenderer: createAdaptiveCardRendererStyle(options),
    animationCardAttachment: createAnimationCardAttachmentStyle(options),
    audioAttachment: createAudioAttachmentStyle(options),
    audioCardAttachment: createAudioCardAttachmentStyle(options),
    audioContent: createAudioContentStyle(options),
    avatar: createAvatarStyle(options),
    bubble: createBubbleStyle(options),
    carouselFilmStrip: createCarouselFilmStrip(options),
    downloadAttachment: createDownloadAttachmentStyle(options),
    errorBox: createErrorBoxStyle(options),
    microphoneButton: createMicrophoneButtonStyle(options),
    options: {
      ...options,
      suggestedActionsStyleSet: createSuggestedActionsStyleSet(options)
    },
    root: createRootStyle(options),
    sendBox: createSendBoxStyle(options),
    sendBoxTextBox: createSendBoxTextBoxStyle(options),
    singleAttachmentActivity: createSingleAttachmentActivityStyle(options),
    stackedLayout: createStackedLayoutStyle(options),
    suggestedAction: createSuggestedActionStyle(options),
    suggestedActions: createSuggestedActionsStyle(options),
    textContent: createTextContentStyle(options),
    timestamp: createTimestampStyle(options),
    typingActivity: createTypingActivityStyle(options),
    uploadButton: createUploadButtonStyle(options),
    videoAttachment: createVideoAttachmentStyle(options),
    videoContent: createVideoContentStyle(options),
    vimeoContent: createVimeoContentStyle(options),
    youTubeContent: createYouTubeContentStyle(options)
  };
}
