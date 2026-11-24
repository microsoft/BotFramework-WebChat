// We should review exports in this file to make sure 1P = 3P.
export {
  __INTERNAL_DO_NOT_USE__getStoreCounts,
  __INTERNAL_DO_NOT_USE__setWebChatEngineEnabled,
  usePostVoiceActivity,
  useShouldShowMicrophoneButton
} from 'botframework-webchat-api/internal.js';
export {
  CodeHighlighterComposer,
  combineCSSModules,
  createIconComponent,
  CSSModuleThemeComposer,
  InjectStyleElements,
  injectStyleElementsPropsSchema,
  parseDocumentFragmentFromString,
  PartGrouping,
  ScreenReaderText,
  serializeDocumentFragmentIntoString,
  useActivityStyleOptions,
  useCodeHighlighter,
  useLiveRegion,
  useStyles
} from 'botframework-webchat-component/internal.js';
export {
  getOrgSchemaMessage,
  getVoiceActivityRole,
  getVoiceActivityText,
  isVoiceTranscriptActivity
} from 'botframework-webchat-core';
export { createWebChatEngine } from 'botframework-webchat-core/internal.js';
