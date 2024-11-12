import React, { type ReactNode, useCallback, useMemo } from 'react';
import { useCodeHighlighter, type CodeHighlighterContextType, type HighlightCodeFn } from './CodeHighlighterComposer';

export const defaultHighlightCode: HighlightCodeFn = (source, language) => {
  try {
    const fragment = document.createDocumentFragment();
    const pre = document.createElement('pre');
    const code = document.createElement('code');

    code.textContent = source;

    // Follow commonmark convention
    language && code.classList.add(`language-${language}`);

    pre.append(code);
    fragment.append(pre);

    return fragment;
  } catch (error) {
    console.warn(`botframework-webchat: Failed to display code`, error);
    return '<pre></pre>';
  }
};

const createCodeHighlighterComposer =
  ({ Provider }: React.Context<CodeHighlighterContextType>) =>
  ({ children, highlightCode }: Readonly<{ children: ReactNode; highlightCode: HighlightCodeFn }>) => {
    const previousCodeHighlighter = useCodeHighlighter();

    const safeHighlightCode = useCallback<HighlightCodeFn>(
      (...args) => {
        try {
          return highlightCode(...args);
        } catch (error) {
          console.warn(`botframework-webchat: Failed to highlight code using ${highlightCode.name}`, error);
          return previousCodeHighlighter(...args);
        }
      },
      [highlightCode, previousCodeHighlighter]
    );

    const CodeHighlighterContextValue = useMemo(
      () => ({
        highlightCode: safeHighlightCode
      }),
      [safeHighlightCode]
    );

    return <Provider value={CodeHighlighterContextValue}>{children}</Provider>;
  };

export default createCodeHighlighterComposer;
