type WebChatCustomPropertyName = `--webchat__${string}`;

const ColorAccent: WebChatCustomPropertyName = '--webchat__color--accent';
const ColorTimestamp: WebChatCustomPropertyName = '--webchat__color--timestamp';
const FontPrimary: WebChatCustomPropertyName = '--webchat__font--primary';
const FontSizeSmall: WebChatCustomPropertyName = '--webchat__font-size--small';
const IconURLExternalLink: WebChatCustomPropertyName = '--webchat__icon-url--external-link';
const MaxWidthBubble: WebChatCustomPropertyName = '--webchat__max-width--bubble';
const MinHeightBubble: WebChatCustomPropertyName = '--webchat__min-height--bubble';
const PaddingRegular: WebChatCustomPropertyName = '--webchat__padding--regular';

// TODO: Unsure if we should export this type.
//       This is because web devs are going to use CSS stylesheet to override us,
//       they are working on CSS rather than JS.

export {
  ColorAccent,
  ColorTimestamp,
  FontPrimary,
  FontSizeSmall,
  IconURLExternalLink,
  MaxWidthBubble,
  MinHeightBubble,
  PaddingRegular
};
