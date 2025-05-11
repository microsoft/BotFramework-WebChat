import {
  CodeHighlighterComposer,
  useCodeHighlighter,
  type HighlightCodeFn
} from './hooks/internal/codeHighlighter/index';
import useInjectStyles from './hooks/internal/useInjectStyles';
import { useLiveRegion } from './providers/LiveRegionTwin/index';
import parseDocumentFragmentFromString from './Utils/parseDocumentFragmentFromString';
import parseProps from './Utils/parseProps';
import serializeDocumentFragmentIntoString from './Utils/serializeDocumentFragmentIntoString';

export {
  CodeHighlighterComposer,
  parseDocumentFragmentFromString,
  parseProps,
  serializeDocumentFragmentIntoString,
  useCodeHighlighter,
  useInjectStyles,
  useLiveRegion
};

export { type HighlightCodeFn };
