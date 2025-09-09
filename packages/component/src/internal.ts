import {
  CodeHighlighterComposer,
  useCodeHighlighter,
  type HighlightCodeFn
} from './hooks/internal/codeHighlighter/index';
import useInjectStyles from './hooks/internal/useInjectStyles';
import { useLiveRegion } from './providers/LiveRegionTwin/index';
import createIconComponent from './Utils/createIconComponent';
import PartGrouping from './Middleware/ActivityGrouping/ui/PartGrouping/PartGrouping';
import parseDocumentFragmentFromString from './Utils/parseDocumentFragmentFromString';
import serializeDocumentFragmentIntoString from './Utils/serializeDocumentFragmentIntoString';

export { default as ScreenReaderText } from './ScreenReaderText';

export {
  CodeHighlighterComposer,
  createIconComponent,
  parseDocumentFragmentFromString,
  PartGrouping,
  serializeDocumentFragmentIntoString,
  useCodeHighlighter,
  useInjectStyles,
  useLiveRegion
};

export { type HighlightCodeFn };
