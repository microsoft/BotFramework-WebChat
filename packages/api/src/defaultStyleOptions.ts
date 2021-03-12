/* eslint no-magic-numbers: "off" */
import StyleOptions from './StyleOptions';

function fontFamily(fonts) {
  return fonts.map(font => `'${font}'`).join(', ');
}

const DEFAULT_ACCENT = '#0063B1';
const DEFAULT_SUBTLE = '#767676'; // With contrast 4.5:1 to white
const PADDING_REGULAR = 10;

const DEFAULT_OPTIONS: StyleOptions = {
  // Basic styling
  accent: DEFAULT_ACCENT,
  backgroundColor: 'White',
  subtle: DEFAULT_SUBTLE,
  paddingRegular: PADDING_REGULAR,
  paddingWide: PADDING_REGULAR * 2,
  fontSizeSmall: '80%',
  monospaceFont: fontFamily(['Consolas', 'Courier New', 'monospace']),
  primaryFont: fontFamily(['Calibri', 'Helvetica Neue', 'Arial', 'sans-serif']),
  // Root
  rootHeight: '100%',
  rootWidth: '100%',
  rootZIndex: 0, // "z-index" for the root container of Web Chat. This will form a new stacking context so "z-index" used in children won't pollute.

  // Avatar
  avatarBorderRadius: '50%',
  avatarSize: 40,
  botAvatarBackgroundColor: undefined,
  botAvatarImage: undefined,
  botAvatarInitials: undefined,
  userAvatarBackgroundColor: undefined,
  userAvatarImage: undefined,
  userAvatarInitials: undefined,
  showAvatarInGroup: 'status',

  // Bubble
  // TODO: Should we make a bubbleFromBot*
  bubbleBackground: 'White',
  bubbleBorderColor: '#E6E6E6',
  bubbleBorderRadius: 2,
  bubbleBorderStyle: 'solid',
  bubbleBorderWidth: 1,
  bubbleFromUserBackground: 'White',
  bubbleFromUserBorderColor: '#E6E6E6',
  bubbleFromUserBorderRadius: 2,
  bubbleFromUserBorderStyle: 'solid',
  bubbleFromUserBorderWidth: 1,
  bubbleFromUserNubOffset: 0,
  bubbleFromUserNubSize: undefined,
  bubbleFromUserTextColor: 'Black',
  bubbleImageHeight: 240,
  bubbleMaxWidth: 480, // Based off screen width = 600px
  bubbleMinHeight: 40,
  bubbleMinWidth: 250, // min screen width = 300px; Microsoft Edge requires 372px (https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/13621468/)
  bubbleNubOffset: 0,
  bubbleNubSize: undefined,
  bubbleTextColor: 'Black',
  messageActivityWordBreak: 'break-word',

  // Connectivity UI
  connectivityIconPadding: PADDING_REGULAR * 1.2,
  connectivityMarginLeftRight: PADDING_REGULAR * 1.4,
  connectivityMarginTopBottom: PADDING_REGULAR * 0.8,
  connectivityTextSize: '75%',
  failedConnectivity: '#C50F1F',
  slowConnectivity: '#EAA300',
  notificationText: '#5E5E5E',
  slowConnectionAfter: 15000,

  // Emoji
  emojiSet: true,

  // Live region - Accessibility
  internalLiveRegionFadeAfter: 1000,

  // Markdown
  markdownRespectCRLF: true,

  // Scroll behavior
  hideScrollToEndButton: false,
  autoScrollSnapOnActivity: false,
  autoScrollSnapOnActivityOffset: 0,
  autoScrollSnapOnPage: false,
  autoScrollSnapOnPageoffset: 0,

  // Send box
  hideSendBox: false,
  hideUploadButton: false,
  microphoneButtonColorOnDictate: '#F33',
  sendBoxBackground: 'White',
  sendBoxButtonColor: undefined,
  sendBoxButtonColorOnDisabled: '#CCC',
  sendBoxButtonColorOnFocus: '#333',
  sendBoxButtonColorOnHover: '#333',
  sendBoxDisabledTextColor: undefined,
  sendBoxHeight: 40,
  sendBoxMaxHeight: 200,
  sendBoxTextColor: 'Black',
  // TODO: We should deprecate this because there isn't an easy way to make the width of the send box narrower than the transcript
  sendBoxBorderBottom: undefined,
  sendBoxBorderLeft: undefined,
  sendBoxBorderRight: undefined,
  sendBoxBorderTop: 'solid 1px #E6E6E6',
  sendBoxPlaceholderColor: undefined,
  sendBoxTextWrap: false,
  sendBoxButtonAlignment: 'stretch',

  // Visually show spoken text
  showSpokenText: false,

  spinnerAnimationBackgroundImage: undefined,
  spinnerAnimationHeight: 16,
  spinnerAnimationWidth: 16,
  spinnerAnimationPadding: 12,

  // Suggested actions
  suggestedActionBackground: 'White',
  suggestedActionBorderColor: undefined,
  suggestedActionBorderRadius: 0,
  suggestedActionBorderStyle: 'solid',
  suggestedActionBorderWidth: 2,
  suggestedActionDisabledBackground: undefined,
  suggestedActionDisabledBorderColor: '#E6E6E6',
  suggestedActionDisabledBorderStyle: 'solid',
  suggestedActionDisabledBorderWidth: 2,
  suggestedActionDisabledTextColor: undefined,
  suggestedActionHeight: 40,
  suggestedActionImageHeight: 20,
  suggestedActionLayout: 'carousel',
  suggestedActionTextColor: undefined,

  // Suggested actions carousel layout
  suggestedActionsCarouselFlipperCursor: undefined,
  suggestedActionsCarouselFlipperBoxWidth: 40,
  suggestedActionsCarouselFlipperSize: 20,

  // Suggested actions flow layout
  suggestedActionsFlowMaxHeight: undefined,

  // Suggested actions stacked layout
  suggestedActionsStackedHeight: undefined,
  suggestedActionsStackedOverflow: undefined,
  suggestedActionsStackedLayoutButtonMaxHeight: undefined,
  suggestedActionsStackedLayoutButtonTextWrap: false,

  // Timestamp
  groupTimestamp: true,
  sendTimeout: 20000,
  sendTimeoutForAttachments: 120000,
  timestampColor: undefined,
  timestampFormat: 'relative',

  // Transcript overlay buttons
  newMessagesButtonFontSize: '85%',
  transcriptOverlayButtonBackground: 'rgba(0, 0, 0, .6)',
  transcriptOverlayButtonBackgroundOnFocus: 'rgba(0, 0, 0, .8)',
  transcriptOverlayButtonBackgroundOnHover: 'rgba(0, 0, 0, .8)',
  transcriptOverlayButtonColor: 'White',
  transcriptOverlayButtonColorOnFocus: undefined,
  transcriptOverlayButtonColorOnHover: undefined,

  // Toast UI

  notificationDebounceTimeout: 400,

  hideToaster: false,
  toasterHeight: 32,
  toasterMaxHeight: 32 * 5,
  toasterSingularMaxHeight: 50,
  toastFontSize: '87.5%',
  toastIconWidth: 36,
  toastSeparatorColor: '#E8EAEC',
  toastTextPadding: 6,

  toastErrorBackgroundColor: '#FDE7E9',
  toastErrorColor: '#A80000',
  toastInfoBackgroundColor: '#CEF1FF',
  toastInfoColor: '#105E7D',
  toastSuccessBackgroundColor: '#DFF6DD',
  toastSuccessColor: '#107C10',
  toastWarnBackgroundColor: '#FFF4CE',
  toastWarnColor: '#3B3A39',

  // Transcript
  transcriptTerminatorBackgroundColor: '#595959',
  transcriptTerminatorBorderRadius: 5,
  transcriptTerminatorColor: 'White',
  transcriptTerminatorFontSize: 12,

  transcriptActivityVisualKeyboardIndicatorColor: DEFAULT_SUBTLE,
  transcriptActivityVisualKeyboardIndicatorStyle: 'dashed',
  transcriptActivityVisualKeyboardIndicatorWidth: 1,

  transcriptVisualKeyboardIndicatorColor: 'Black',
  transcriptVisualKeyboardIndicatorStyle: 'solid',
  transcriptVisualKeyboardIndicatorWidth: 2,

  // Typing animation
  typingAnimationBackgroundImage: undefined,
  typingAnimationDuration: 5000,
  typingAnimationHeight: 20,
  typingAnimationWidth: 64,

  // Upload thumbnail
  // TODO: [P0] #3322 This is only supported in HTML.
  enableUploadThumbnail: true,
  uploadThumbnailContentType: 'image/jpeg',
  uploadThumbnailHeight: 360,
  uploadThumbnailQuality: 0.6,
  uploadThumbnailWidth: 720,

  // Video
  videoHeight: 270 // based on bubbleMaxWidth: 480 / 16 * 9 = 270
};

export default DEFAULT_OPTIONS;
