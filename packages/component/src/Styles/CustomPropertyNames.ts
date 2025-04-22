const CustomPropertyNames = Object.freeze({
  // Make sure key names does not have JavaScript forbidden names.
  BackgroundCodeBlock: '--webchat__background--code-block',
  BorderAnimationColor1: '--webchat__border-animation--color-1',
  BorderAnimationColor2: '--webchat__border-animation--color-2',
  BorderAnimationColor3: '--webchat__border-animation--color-3',
  ColorAccent: '--webchat__color--accent',
  ColorCodeBlock: '--webchat__color--code-block',
  ColorSubtle: '--webchat__color--subtle',
  ColorTimestamp: '--webchat__color--timestamp',
  FontPrimary: '--webchat__font--primary',
  FontSizeSmall: '--webchat__font-size--small',
  IconURLExternalLink: '--webchat__icon-url--external-link',
  MaxHeightImageBubble: '--webchat__max-height--image-bubble',
  MaxWidthAttachmentBubble: '--webchat__max-width--attachment-bubble',
  MaxWidthMessageBubble: '--webchat__max-width--message-bubble',
  MinHeightBubble: '--webchat__min-height--bubble',
  MinHeightImageBubble: '--webchat__min-height--image-bubble',
  MinWidthAttachmentBubble: '--webchat__min-width--attachment-bubble',
  MinWidthMessageBubble: '--webchat__min-width--message-bubble',
  PaddingRegular: '--webchat__padding--regular',
  SizeAvatar: '--webchat__size--avatar'
}) satisfies Readonly<Record<string, `--webchat__${string}`>>;

export default CustomPropertyNames;
