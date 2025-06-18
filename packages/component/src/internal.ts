import {
  CodeHighlighterComposer,
  useCodeHighlighter,
  type HighlightCodeFn
} from './hooks/internal/codeHighlighter/index';
import useInjectStyles from './hooks/internal/useInjectStyles';
import { useLiveRegion } from './providers/LiveRegionTwin/index';
import parseDocumentFragmentFromString from './Utils/parseDocumentFragmentFromString';
import serializeDocumentFragmentIntoString from './Utils/serializeDocumentFragmentIntoString';
import createIconComponent from './Utils/createIconComponent';

export {
  CodeHighlighterComposer,
  createIconComponent,
  parseDocumentFragmentFromString,
  serializeDocumentFragmentIntoString,
  useCodeHighlighter,
  useInjectStyles,
  useLiveRegion
};

export { type HighlightCodeFn };
