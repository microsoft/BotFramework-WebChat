const CustomPropertyNames = Object.freeze({
  // Make sure key names does not have JavaScript forbidden names.
  ColorAccent: '--webchat__color--accent',
  ColorTimestamp: '--webchat__color--timestamp',
  FontPrimary: '--webchat__font--primary',
  FontSizeSmall: '--webchat__font-size--small',
  IconURLExternalLink: '--webchat__icon-url--external-link',
  MaxWidthBubble: '--webchat__max-width--bubble',
  MinHeightBubble: '--webchat__min-height--bubble',
  PaddingRegular: '--webchat__padding--regular'
});

// This is for type-checking only to make sure the CSS custom property names is `--webchat__${string}`.
const _TypeChecking: Readonly<Record<string, `--webchat__${string}`>> = CustomPropertyNames;

export default CustomPropertyNames;
