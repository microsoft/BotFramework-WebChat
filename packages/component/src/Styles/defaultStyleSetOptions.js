const DEFAULT_OPTIONS = {
  accent: '#69F',
  avatarSize: 40,

  backgroundColor: 'White',

  bubbleBackground: 'White',
  bubbleBorder: 'solid 1px #E6E6E6',
  bubbleBorderRadius: 2,
  bubbleImageHeight: 240,
  bubbleMinHeight: 40,
  bubbleMaxWidth: 480, // screen width = 600px
  bubbleMinWidth: 250, // min screen width = 300px, Edge requires 372px (https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/13621468/)
  bubbleTextColor: 'Black',

  paddingRegular: 10,

  scrollToBottomThreshold: 40,
  sendBoxHeight: 40,

  // Visually show spoken text
  showSpokenText: false,

  timestampColor: 'rgba(0, 0, 0, .2)',

  videoHeight: 270 // based on bubbleMaxWidth, 480 / 16 * 9 = 270
};

export default DEFAULT_OPTIONS
