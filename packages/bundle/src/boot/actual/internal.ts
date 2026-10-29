// We should review exports in this file to make sure 1P = 3P.
export { usePostVoiceActivity, useShouldShowMicrophoneButton } from 'botframework-webchat-api/internal.js';
export {
  CodeHighlighterComposer,
  createIconComponent,
  InjectStyleElements,
  injectStyleElementsPropsSchema,
  parseDocumentFragmentFromString,
  PartGrouping,
  ScreenReaderText,
  serializeDocumentFragmentIntoString,
  useActivityStyleOptions,
  useCodeHighlighter,
  useLiveRegion
} from 'botframework-webchat-component/internal.js';
export {
  getOrgSchemaMessage,
  getVoiceActivityRole,
  getVoiceActivityText,
  isVoiceTranscriptActivity
} from 'botframework-webchat-core';
