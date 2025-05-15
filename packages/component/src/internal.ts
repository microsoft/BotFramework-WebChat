import {
  CodeHighlighterComposer,
  useCodeHighlighter,
  type HighlightCodeFn
} from './hooks/internal/codeHighlighter/index';
import useInjectStyles from './hooks/internal/useInjectStyles';
import { useLiveRegion } from './providers/LiveRegionTwin/index';
import parseDocumentFragmentFromString from './Utils/parseDocumentFragmentFromString';
import serializeDocumentFragmentIntoString from './Utils/serializeDocumentFragmentIntoString';

export {
  CodeHighlighterComposer,
  parseDocumentFragmentFromString,
  serializeDocumentFragmentIntoString,
  useCodeHighlighter,
  useInjectStyles,
  useLiveRegion
};

export { type HighlightCodeFn };
