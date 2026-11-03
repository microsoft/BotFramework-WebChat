import { normalizeStyleOptions, StyleOptions } from 'botframework-webchat-api';

import createActivitiesStyle from './StyleSet/Activities';
import createActivityButtonStyle from './StyleSet/ActivityButton';
import createActivityCopyButtonStyle from './StyleSet/ActivityCopyButton';
import createAudioAttachmentStyle from './StyleSet/AudioAttachment';
import createAudioContentStyle from './StyleSet/AudioContent';
import createAutoResizeTextAreaStyle from './StyleSet/AutoResizeTextArea';
import createAvatarStyle from './StyleSet/Avatar';
import createBasicTranscriptStyle from './StyleSet/BasicTranscript';
import createBubbleStyle from './StyleSet/Bubble';
import createCarouselFilmStrip from './StyleSet/CarouselFilmStrip';
import createCarouselFilmStripAttachment from './StyleSet/CarouselFilmStripAttachment';
import createCarouselFlipper from './StyleSet/CarouselFlipper';
import createChatHistoryBoxStyleSet from './StyleSet/ChatHistoryBox';
import createCitationModalDialogStyle from './StyleSet/CitationModalDialog';
import createConnectivityNotification from './StyleSet/ConnectivityNotification';
import createDictationInterimsStyle from './StyleSet/DictationInterims';
import createErrorBoxStyle from './StyleSet/ErrorBox';
import createErrorNotificationStyle from './StyleSet/ErrorNotification';
import createFileContentStyle from './StyleSet/FileContent';
import createImageAvatarStyle from './StyleSet/ImageAvatar';
import createInitialsAvatarStyle from './StyleSet/InitialsAvatar';
import createLinkDefinitionsStyle from './StyleSet/LinkDefinitions';
import createMicrophoneButtonStyle from './StyleSet/MicrophoneButton';
import createModalDialogStyle from './StyleSet/ModalDialog';
import createRenderMarkdownStyle from './StyleSet/RenderMarkdown';
import createRootStyle from './StyleSet/Root';
import createScrollToEndButtonStyle from './StyleSet/ScrollToEndButton';
import createSendBoxStyle from './StyleSet/SendBox';
import createSendBoxButtonStyle from './StyleSet/SendBoxButton';
import createSendBoxTextBoxStyle from './StyleSet/SendBoxTextBox';
import createSendStatusStyle from './StyleSet/SendStatus';
import createSpinnerAnimationStyle from './StyleSet/SpinnerAnimation';
import createStackedLayoutStyle from './StyleSet/StackedLayout';
import createSuggestedActionStyle from './StyleSet/SuggestedAction';
import createSuggestedActionsStyle from './StyleSet/SuggestedActions';
import createTextContentStyle from './StyleSet/TextContent';
import createThumbButtonStyle from './StyleSet/ThumbButton';
import createToastStyle from './StyleSet/Toast';
import createToasterStyle from './StyleSet/Toaster';
import createTooltipStyle from './StyleSet/Tooltip';
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

  return Object.freeze({
    activities: createActivitiesStyle(),
    /**
     * @deprecated Not used for rendering since 4.19.0 (PR #5670), customizing it has no effect.
     * The live styles are in `packages/component/src/Attachment/Text/private/ActivityButton.module.css`.
     * This style set will be removed on or after 2028-10-16.
     */
    activityButton: createActivityButtonStyle(),
    /**
     * @deprecated Not used for rendering since 4.19.0 (PR #5670), customizing it has no effect.
     * The live styles are in `packages/component/src/Attachment/Text/private/ActivityCopyButton.module.css`.
     * This style set will be removed on or after 2028-10-16.
     */
    activityCopyButton: createActivityCopyButtonStyle(),
    audioAttachment: createAudioAttachmentStyle(),
    audioContent: createAudioContentStyle(),
    autoResizeTextArea: createAutoResizeTextAreaStyle(strictStyleOptions),
    avatar: createAvatarStyle(strictStyleOptions),
    /**
     * @deprecated Not used for rendering since 4.19.0 (PR #5553), customizing it has no effect.
     * The live styles are in `packages/component/src/Transcript/TranscriptFocus/TranscriptFocus.module.css`.
     * This style set will be removed on or after 2028-10-16.
     */
    basicTranscript: createBasicTranscriptStyle(strictStyleOptions),
    /**
     * @deprecated Not used for rendering since 4.19.0 (PR #5668), customizing it has no effect.
     * The live styles are in `packages/component/src/Activity/Bubble.module.css`.
     * This style set will be removed on or after 2028-10-16.
     */
    bubble: createBubbleStyle(strictStyleOptions),
    /**
     * @deprecated Not used for rendering since 4.19.0 (PR #5668), customizing it has no effect.
     * The live styles are in `packages/component/src/Activity/CarouselFilmStrip.module.css`.
     * This style set will be removed on or after 2028-10-16.
     */
    carouselFilmStrip: createCarouselFilmStrip(strictStyleOptions),
    /**
     * @deprecated Not used for rendering since 4.19.0 (PR #5668), customizing it has no effect.
     * The live styles are in `packages/component/src/Activity/CarouselFilmStripAttachment.module.css`.
     * This style set will be removed on or after 2028-10-16.
     */
    carouselFilmStripAttachment: createCarouselFilmStripAttachment(strictStyleOptions),
    /**
     * @deprecated Not used for rendering since 4.19.0 (PR #5668), customizing it has no effect.
     * The live styles are in `packages/component/src/Activity/CarouselLayout.module.css`.
     * This style set will be removed on or after 2028-10-16.
     */
    carouselFlipper: createCarouselFlipper(strictStyleOptions),
    connectivityNotification: createConnectivityNotification(strictStyleOptions),
    dictationInterims: createDictationInterimsStyle(strictStyleOptions),
    errorBox: createErrorBoxStyle(strictStyleOptions),
    errorNotification: createErrorNotificationStyle(strictStyleOptions),
    fileContent: createFileContentStyle(strictStyleOptions),
    imageAvatar: createImageAvatarStyle(),
    initialsAvatar: createInitialsAvatarStyle(strictStyleOptions),
    microphoneButton: createMicrophoneButtonStyle(strictStyleOptions),
    options: { ...strictStyleOptions }, // Cloned to make sure no additional modifications will propagate up.
    root: createRootStyle(strictStyleOptions),
    scrollToEndButton: createScrollToEndButtonStyle(strictStyleOptions),
    sendBox: createSendBoxStyle(strictStyleOptions),
    sendBoxButton: createSendBoxButtonStyle(strictStyleOptions),
    sendBoxTextBox: createSendBoxTextBoxStyle(strictStyleOptions),
    spinnerAnimation: createSpinnerAnimationStyle(strictStyleOptions),
    /**
     * @deprecated Not used for rendering since 4.19.0 (PR #5506), customizing it has no effect.
     * The live styles are in `packages/component/src/Activity/StackedLayout.module.css`.
     * This style set will be removed on or after 2028-10-16.
     */
    stackedLayout: createStackedLayoutStyle(strictStyleOptions),
    suggestedAction: createSuggestedActionStyle(strictStyleOptions),
    suggestedActions: createSuggestedActionsStyle(strictStyleOptions),
    toast: createToastStyle(strictStyleOptions),
    toaster: createToasterStyle(strictStyleOptions),
    typingAnimation: createTypingAnimationStyle(strictStyleOptions),
    typingIndicator: createTypingIndicatorStyle(strictStyleOptions),
    uploadButton: createUploadButtonStyle(strictStyleOptions),
    videoAttachment: createVideoAttachmentStyle(),
    videoContent: createVideoContentStyle(strictStyleOptions),
    vimeoContent: createVimeoContentStyle(strictStyleOptions),
    warningNotification: createWarningNotificationStyle(strictStyleOptions),
    youTubeContent: createYouTubeContentStyle(strictStyleOptions),

    // Following styles follows new house rules:
    // - Use CSS var instead of strictStyleOptions
    chatHistoryBox: createChatHistoryBoxStyleSet(),
    /**
     * @deprecated Not used for rendering since 4.19.0 (PR #5670), customizing it has no effect.
     * The live styles are in `packages/component/src/Attachment/Text/private/CitationModal.module.css`.
     * This style set will be removed on or after 2028-10-16.
     */
    citationModalDialog: createCitationModalDialogStyle(),
    /**
     * @deprecated Not used for rendering since 4.19.0 (PR #5670), customizing it has no effect.
     * The live styles are in `packages/component/src/LinkDefinition/LinkDefinitions.module.css`.
     * This style set will be removed on or after 2028-10-16.
     */
    linkDefinitions: createLinkDefinitionsStyle(),
    /**
     * @deprecated Not used for rendering since 4.19.3, customizing it has no effect.
     * The live styles are in `packages/component/src/providers/ModalDialog/private/Popover.module.css`.
     * This style set will be removed on or after 2028-10-16.
     */
    modalDialog: createModalDialogStyle(),
    /**
     * @deprecated Not used for rendering since 4.19.0 (PR #5670), customizing it has no effect.
     * The live styles are in `packages/component/src/hooks/RenderMarkdown.module.css`.
     * This style set will be removed on or after 2028-10-16.
     */
    renderMarkdown: createRenderMarkdownStyle(),
    /**
     * @deprecated Not used for rendering since 4.19.0 (PR #5669), customizing it has no effect.
     * The live styles are in `packages/component/src/ActivityStatus/ActivityStatus.module.css`.
     * This style set will be removed on or after 2028-10-16.
     */
    sendStatus: createSendStatusStyle(),
    /**
     * @deprecated Not used for rendering since 4.19.0 (PR #5670), customizing it has no effect.
     * The live styles are in `packages/component/src/Attachment/Text/TextContent.module.css`.
     * This style set will be removed on or after 2028-10-16.
     */
    textContent: createTextContentStyle(),
    /**
     * @deprecated Not used for rendering since 4.19.0 (PR #5669), customizing it has no effect.
     * The live styles are in `packages/component/src/ActivityFeedback/private/ThumbButton.module.css`.
     * This style set will be removed on or after 2028-10-16.
     */
    thumbButton: createThumbButtonStyle(),
    /**
     * @deprecated Not used for rendering since 4.19.3, customizing it has no effect.
     * The live styles are in `packages/component/src/Tooltip/private/Tooltip.module.css`.
     * This style set will be removed on or after 2028-10-16.
     */
    tooltip: createTooltipStyle()
  } as const);
}
