/* eslint no-magic-numbers: "off" */

function fontFamily(fonts) {
  return fonts.map(font => `'${font}'`).join(', ');
}

const DEFAULT_ACCENT = '#0063B1';
const DEFAULT_SUBTLE = '#767676'; // With contrast 4.5:1 to white
const PADDING_REGULAR = 10;

const DEFAULT_OPTIONS = {
  // Color and paddings
  accent: DEFAULT_ACCENT,
  backgroundColor: 'White',
  cardEmphasisBackgroundColor: '#F0F0F0',
  paddingRegular: PADDING_REGULAR,
  paddingWide: PADDING_REGULAR * 2,
  subtle: DEFAULT_SUBTLE,

  // Word break
  messageActivityWordBreak: 'break-word', // 'normal' || 'break-all' || 'break-word' || 'keep-all'

  // Fonts
  fontSizeSmall: '80%',
  monospaceFont: fontFamily(['Consolas', 'Courier New', 'monospace']),
  primaryFont: fontFamily(['Calibri', 'Helvetica Neue', 'Arial', 'sans-serif']),

  // Avatar
  avatarBorderRadius: '50%',
  avatarSize: 40,
  botAvatarBackgroundColor: undefined, // defaults to accent color
  botAvatarImage: undefined, // Or a string of URL. Can be a data URI or blob.
  botAvatarInitials: undefined, // Or a string. Empty strings means it has avatar but not initials inside.
  userAvatarBackgroundColor: undefined, // defaults to accent color
  userAvatarImage: undefined, // Or a string of URL. Can be a data URI or blob.
  userAvatarInitials: undefined, // Or a string. Empty strings means it has avatar but not initials inside.
  showAvatarInGroup: 'status', // Or 'sender' or true (on every activity).

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
  bubbleFromUserNubOffset: 0, // Either a positive/negative number, or "bottom"
  bubbleFromUserNubSize: undefined, // Or a number. 0 means a sharp corner.
  bubbleFromUserTextColor: 'Black',
  bubbleImageHeight: 240,
  bubbleMaxWidth: 480, // screen width = 600px
  bubbleMinHeight: 40,
  bubbleMinWidth: 250, // min screen width = 300px, Edge requires 372px (https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/13621468/)
  bubbleNubOffset: 0, // Either a positive/negative number, or "bottom"
  bubbleNubSize: undefined, // Or a number. 0 means a sharp corner.
  bubbleTextColor: 'Black',

  // Markdown
  markdownRespectCRLF: true,

  // Rich Cards
  richCardWrapTitle: false, // Applies to subtitles as well

  // Root
  rootHeight: '100%',
  rootWidth: '100%',
  rootZIndex: 0, // "z-index" for the root container of Web Chat. This will form a new stacking context so "z-index" used in children won't pollute.

  // Scroll to end button
  hideScrollToEndButton: false,

  // Send box
  hideSendBox: false,
  hideUploadButton: false,
  microphoneButtonColorOnDictate: '#F33',
  sendBoxBackground: 'White',
  sendBoxButtonColor: undefined, // defaults to subtle
  sendBoxButtonColorOnDisabled: '#CCC',
  sendBoxButtonColorOnFocus: '#333',
  sendBoxButtonColorOnHover: '#333',
  sendBoxDisabledTextColor: undefined, // defaults to subtle
  sendBoxHeight: 40,
  sendBoxMaxHeight: 200,
  sendBoxTextColor: 'Black',
  // TODO: We should deprecate this because there isn't an easy way to make the width of the send box narrower than the transcript
  sendBoxBorderBottom: '',
  sendBoxBorderLeft: '',
  sendBoxBorderRight: '',
  sendBoxBorderTop: 'solid 1px #E6E6E6',
  sendBoxPlaceholderColor: undefined, // defaults to subtle
  sendBoxTextWrap: false,

  // Visually show spoken text
  showSpokenText: false,

  // Suggested actions
  suggestedActionBackground: 'White',
  suggestedActionBorder: undefined, // split into 3, null
  suggestedActionBorderColor: undefined, // defaults to accent
  suggestedActionBorderRadius: 0,
  suggestedActionBorderStyle: 'solid',
  suggestedActionBorderWidth: 2,
  suggestedActionDisabledBackground: undefined, // defaults to suggestedActionBackground
  suggestedActionDisabledBorder: null,
  suggestedActionDisabledBorderColor: '#E6E6E6',
  suggestedActionDisabledBorderStyle: 'solid',
  suggestedActionDisabledBorderWidth: 2,
  suggestedActionDisabledTextColor: undefined, // defaults to subtle
  suggestedActionHeight: 40,
  suggestedActionImageHeight: 20,
  suggestedActionLayout: 'carousel', // either 'carousel' or 'stacked'
  suggestedActionTextColor: null,

  // Suggested actions 'stacked' layout
  suggestedActionsStackedHeight: undefined, // defaults to 'auto'
  suggestedActionsStackedOverflow: undefined, // defaults to 'auto'

  // Timestamp
  groupTimestamp: true,
  sendTimeout: 20000,
  sendTimeoutForAttachments: 120000,
  timestampColor: undefined, // defaults to subtle
  timestampFormat: 'relative', // 'absolute'

  // Transcript overlay buttons (e.g. carousel and suggested action flippers, scroll to bottom, etc.)
  newMessagesButtonFontSize: '85%',
  transcriptOverlayButtonBackground: 'rgba(0, 0, 0, .6)',
  transcriptOverlayButtonBackgroundOnFocus: 'rgba(0, 0, 0, .8)',
  transcriptOverlayButtonBackgroundOnHover: 'rgba(0, 0, 0, .8)',
  transcriptOverlayButtonColor: 'White',
  transcriptOverlayButtonColorOnFocus: undefined, // defaults to transcriptOverlayButtonColor
  transcriptOverlayButtonColorOnHover: undefined, // defaults to transcriptOverlayButtonColor

  // Video
  videoHeight: 270, // based on bubbleMaxWidth: 480 / 16 * 9 = 270

  // Connectivity UI
  connectivityIconPadding: PADDING_REGULAR * 1.2,
  connectivityMarginLeftRight: PADDING_REGULAR * 1.4,
  connectivityMarginTopBottom: PADDING_REGULAR * 0.8,
  connectivityTextSize: '75%',
  failedConnectivity: '#C50F1F',
  slowConnectivity: '#EAA300',
  notificationText: '#5E5E5E',
  slowConnectionAfter: 15000,

  typingAnimationBackgroundImage: null,
  typingAnimationDuration: 5000,
  typingAnimationHeight: 20,
  typingAnimationWidth: 64,

  spinnerAnimationBackgroundImage: null,
  spinnerAnimationHeight: 16,
  spinnerAnimationWidth: 16,
  spinnerAnimationPadding: 12,

  enableUploadThumbnail: true,
  uploadThumbnailContentType: 'image/jpeg',
  uploadThumbnailHeight: 360,
  uploadThumbnailQuality: 0.6,
  uploadThumbnailWidth: 720,

  // deprecated; will be removed on or after 2021-02-01
  spinnerAnimationPaddingRight: undefined,

  // Toast UI

  // New debounce timeout value only affects new notifications.
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

  // Emoji
  emojiSet: true // true || false || { ':)' : '😊'}
};

export default DEFAULT_OPTIONS;
