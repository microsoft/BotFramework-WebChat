import { useCallback } from 'react';
import parseDocumentFragmentFromString from '../../../Utils/parseDocumentFragmentFromString';
import serializeDocumentFragmentIntoString from '../../../Utils/serializeDocumentFragmentIntoString';
import { useTransformHTMLContent } from '../..';
import { defaultHighlightCode } from './private/createCodeHighlighterComposer';
import { type HighlightCodeFn } from './private/CodeHighlighterComposer';

export function useCodeHighlighterWithTransform() {
  const transformHTMLContent = useTransformHTMLContent();

  return useCallback<(...args: Parameters<HighlightCodeFn>) => string>(
    (...args) => {
      const pre = defaultHighlightCode(...args);
      const preFragment = pre instanceof DocumentFragment ? pre : parseDocumentFragmentFromString(pre);
      return serializeDocumentFragmentIntoString(transformHTMLContent(preFragment));
    },
    [transformHTMLContent]
  );
}
