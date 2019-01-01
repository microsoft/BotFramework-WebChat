// TODO: [P4] Rename styleSetOptions to styleOptions
const DEFAULT_ACCENT = '#0063B1';
const DEFAULT_SUBTLE = '#767676'; // With contrast 4.5:1 to white

const DEFAULT_OPTIONS = {
  // Color and paddings
  accent: DEFAULT_ACCENT,
  backgroundColor: 'White',
  paddingRegular: 10,
  paddingWide: 20,
  subtle: DEFAULT_SUBTLE,

  // Avatar
  avatarSize: 40,
  botAvatarImage: '',
  botAvatarInitials: '',
  userAvatarImage: '',
  userAvatarInitials: '',

  // Bubble
  bubbleBackground: 'White',
  bubbleBorder: 'solid 1px #E6E6E6',
  bubbleBorderRadius: 2,
  bubbleFromUserBackground: 'White',
  bubbleFromUserBorder: 'solid 1px #E6E6E6',
  bubbleFromUserBorderRadius: 2,
  bubbleFromUserTextColor: 'Black',
  bubbleImageHeight: 240,
  bubbleMaxWidth: 480, // screen width = 600px
  bubbleMinHeight: 40,
  bubbleMinWidth: 250, // min screen width = 300px, Edge requires 372px (https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/13621468/)
  bubbleTextColor: 'Black',

  // Send box
  hideSendBox: false,
  hideUploadButton: false,
  microphoneButtonColorOnDictate: '#F33',
  sendBoxButtonColor: '#767676',
  sendBoxButtonColorOnDisabled: '#CCC',
  sendBoxButtonColorOnFocus: '#333',
  sendBoxButtonColorOnHover: '#333',
  sendBoxHeight: 40,

  // Visually show spoken text
  showSpokenText: false,

  // Suggested actions
  suggestedActionBackground: 'White',
  suggestedActionBorder: `solid 2px ${ DEFAULT_ACCENT }`,
  suggestedActionBorderRadius: 0,
  suggestedActionTextColor: DEFAULT_ACCENT,
  suggestedActionDisabledBackground: 'White',
  suggestedActionDisabledBorder: `solid 2px #E6E6E6`,
  suggestedActionDisabledTextColor: DEFAULT_SUBTLE,
  suggestedActionHeight: 40,

  // Timestamp
  timestampColor: DEFAULT_SUBTLE,

  // Transcript overlay buttons (e.g. carousel and scroll to bottom)
  transcriptOverlayButtonBackground: 'rgba(0, 0, 0, .6)',
  transcriptOverlayButtonBackgroundOnFocus: 'rgba(0, 0, 0, .8)',
  transcriptOverlayButtonBackgroundOnHover: 'rgba(0, 0, 0, .8)',
  transcriptOverlayButtonColor: 'White',
  transcriptOverlayButtonColorOnFocus: 'White',
  transcriptOverlayButtonColorOnHover: 'White',

  // Video
  videoHeight: 270 // based on bubbleMaxWidth, 480 / 16 * 9 = 270
};

export default DEFAULT_OPTIONS
