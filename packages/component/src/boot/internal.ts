export {
  betterLinkDocumentMod,
  parseDocumentFragmentFromString,
  serializeDocumentFragmentIntoString,
  type BetterLinkDocumentModAttributeSetter,
  type BetterLinkDocumentModDecoration
} from '@msinternal/botframework-webchat-component-better-link';
export { InjectStyleElements, injectStyleElementsPropsSchema } from '@msinternal/botframework-webchat-styles/react';
export { default as ActivityButton } from '../Attachment/Text/private/ActivityButton';
export {
  CodeHighlighterComposer,
  useCodeHighlighter,
  type HighlightCodeFn
} from '../hooks/internal/codeHighlighter/index';
export { default as PartGrouping } from '../Middleware/ActivityGrouping/ui/PartGrouping/PartGrouping';
export { useLiveRegion, useQueueStaticElement } from '../providers/LiveRegionTwin/index';
export { default as ScreenReaderText } from '../ScreenReaderText';
export { htmlTextAlternatives } from '../Utils/activityAltText';
export { default as createIconComponent } from '../Utils/createIconComponent';
export { default as FixedWidthImage } from '../Utils/FixedWidthImage';

// For type portability
export { type __INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol } from 'botframework-webchat-api/internal.js';
