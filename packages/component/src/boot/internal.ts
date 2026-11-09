export {
  betterLinkDocumentMod,
  parseDocumentFragmentFromString,
  serializeDocumentFragmentIntoString,
  type BetterLinkDocumentModAttributeSetter,
  type BetterLinkDocumentModDecoration
} from '@msinternal/botframework-webchat-component-better-link';
// The styles package is bundled into every package that imports it, and each copy has its own React context.
// Other packages must use this copy, so a theme above Web Chat reaches every useStyles().
export {
  combineCSSModules,
  CSSModuleThemeComposer,
  InjectStyleElements,
  injectStyleElementsPropsSchema,
  useStyles
} from '@msinternal/botframework-webchat-styles/react';
export { default as ActivityButton } from '../Attachment/Text/private/ActivityButton';
export {
  CodeHighlighterComposer,
  useCodeHighlighter,
  type HighlightCodeFn
} from '../hooks/internal/codeHighlighter/index';
export { default as useActivityStyleOptions } from '../hooks/internal/useActivityStyleOptions.js';
export { default as PartGrouping } from '../Middleware/ActivityGrouping/ui/PartGrouping/PartGrouping';
export { useLiveRegion, useQueueStaticElement } from '../providers/LiveRegionTwin/index';
export { default as ScreenReaderText } from '../ScreenReaderText';
export { htmlTextAlternatives } from '../Utils/activityAltText';
export { default as createIconComponent } from '../Utils/createIconComponent';
export { default as FixedWidthImage } from '../Utils/FixedWidthImage';

// For type portability
export { type __INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol } from 'botframework-webchat-api/internal.js';
