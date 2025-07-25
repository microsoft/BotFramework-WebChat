const CustomPropertyNames = Object.freeze({
  // Make sure key names does not have JavaScript forbidden names.
  BackgroundCodeBlock: '--webchat__background--code-block',
  BackgroundTranscriptTerminator: '--webchat__background--transcript-terminator',
  BorderAnimationColor1: '--webchat__border-animation--color-1',
  BorderAnimationColor2: '--webchat__border-animation--color-2',
  BorderAnimationColor3: '--webchat__border-animation--color-3',
  BorderColorBubble: '--webchat__border-color--bubble',
  BorderRadiusBubble: '--webchat__border-radius--bubble',
  BorderStyleBubble: '--webchat__border-style--bubble',
  BorderStyleTranscriptActivityVisualKeyboardIndicator:
    '--webchat__border-style--transcript-activity-visual-keyboard-indicator',
  BorderStyleTranscriptVisualKeyboardIndicator: '--webchat__border-style--transcript-visual-keyboard-indicator',
  BorderWidthBubble: '--webchat__border-width--bubble',
  BorderWidthTranscriptActivityVisualKeyboardIndicator:
    '--webchat__border-width--transcript-activity-visual-keyboard-indicator',
  BorderRadiusTranscriptTerminator: '--webchat__border-radius--transcript-terminator',
  BorderWidthTranscriptVisualKeyboardIndicator: '--webchat__border-width--transcript-visual-keyboard-indicator',
  ColorAccent: '--webchat__color--accent',
  ColorCodeBlock: '--webchat__color--code-block',
  ColorSubtle: '--webchat__color--subtle',
  ColorTimestamp: '--webchat__color--timestamp',
  ColorTranscriptActivityVisualKeyboardIndicator: '--webchat__color--transcript-activity-visual-keyboard-indicator',
  ColorTranscriptTerminator: '--webchat__color--transcript-terminator',
  ColorTranscriptVisualKeyboardIndicator: '--webchat__color--transcript-visual-keyboard-indicator',
  FontPrimary: '--webchat__font--primary',
  FontSizeSmall: '--webchat__font-size--small',
  FontSizeTranscriptTerminator: '--webchat__font-size--transcript-terminator',
  IconURLExternalLink: '--webchat__icon-url--external-link',
  MaxHeightImageBubble: '--webchat__max-height--image-bubble',
  MaxHeightSendBoxAttachmentBar: '--webchat__max-height--send-box-attachment-bar',
  MaxWidthAttachmentBubble: '--webchat__max-width--attachment-bubble',
  MaxWidthMessageBubble: '--webchat__max-width--message-bubble',
  MinHeightBubble: '--webchat__min-height--bubble',
  MinHeightImageBubble: '--webchat__min-height--image-bubble',
  MinWidthAttachmentBubble: '--webchat__min-width--attachment-bubble',
  MinWidthMessageBubble: '--webchat__min-width--message-bubble',
  PaddingRegular: '--webchat__padding--regular',
  SizeAvatar: '--webchat__size--avatar',
  TransitionDuration: '--webchat__transition-duration'
}) satisfies Readonly<Record<string, `--webchat__${string}`>>;

export default CustomPropertyNames;
