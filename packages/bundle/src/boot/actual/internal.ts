// We should review exports in this file to make sure 1P = 3P.
export {
  type ActivityMiddleware,
  type ActivityStatusMiddleware,
  type TypingIndicatorMiddleware
} from 'botframework-webchat-api';
export { usePostVoiceActivity, useShouldShowMicrophoneButton } from 'botframework-webchat-api/internal';
export {
  CodeHighlighterComposer,
  createIconComponent,
  InjectStyleElements,
  injectStyleElementsPropsSchema,
  parseDocumentFragmentFromString,
  PartGrouping,
  ScreenReaderText,
  serializeDocumentFragmentIntoString,
  useCodeHighlighter,
  useLiveRegion,
  type HighlightCodeFn
} from 'botframework-webchat-component/internal';
export {
  getOrgSchemaMessage,
  getVoiceActivityRole,
  getVoiceActivityText,
  isVoiceTranscriptActivity,
  type DirectLineCardAction,
  type WebChatActivity
} from 'botframework-webchat-core';
