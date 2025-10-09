// We should review exports in this file to make sure 1P = 3P.
export { type ActivityMiddleware, type TypingIndicatorMiddleware } from 'botframework-webchat-api';
export {
  CodeHighlighterComposer,
  createIconComponent,
  parseDocumentFragmentFromString,
  PartGrouping,
  ScreenReaderText,
  serializeDocumentFragmentIntoString,
  useCodeHighlighter,
  useInjectStyleElements,
  useLiveRegion,
  type HighlightCodeFn
} from 'botframework-webchat-component/internal';
export { getOrgSchemaMessage, type DirectLineCardAction, type WebChatActivity } from 'botframework-webchat-core';
