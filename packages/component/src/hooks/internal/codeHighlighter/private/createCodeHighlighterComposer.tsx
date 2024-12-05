import React, { type ReactNode, useCallback, useMemo } from 'react';

import { useCodeHighlighter, type CodeHighlighterContextType, type HighlightCodeFn } from './CodeHighlighterComposer';

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
