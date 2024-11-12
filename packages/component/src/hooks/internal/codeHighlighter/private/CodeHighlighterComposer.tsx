import { createContext, useContext, memo } from 'react';
import createCodeHighlighterComposer, { defaultHighlightCode } from './createCodeHighlighterComposer';
import { StyleOptions } from 'botframework-webchat-api';

export type HighlightCodeFn = (
  code: string,
  language?: string | undefined,
  options?:
    | {
        theme: StyleOptions['codeBlockTheme'];
      }
    | undefined
) => string | DocumentFragment;

export type CodeHighlighterContextType = {
  highlightCode: HighlightCodeFn;
};

const CodeHighlighterContext = createContext<CodeHighlighterContextType>(
  Object.freeze({
    highlightCode: defaultHighlightCode
  })
);

export function useCodeHighlighter() {
  return useContext(CodeHighlighterContext).highlightCode;
}

export const CodeHighlighterComposer = memo(createCodeHighlighterComposer(CodeHighlighterContext));

CodeHighlighterComposer.displayName = 'CodeHighlighterComposer';
