import React, { type ReactNode, useCallback, useMemo } from 'react';

import { useCodeHighlighter, type CodeHighlighterContextType, type HighlightCodeFn } from './CodeHighlighterComposer';

const createCodeHighlighterComposer =
  ({ Provider }: React.Context<CodeHighlighterContextType>) =>
  ({
    children,
    highlightCode
  }: {
    readonly children: ReactNode;
    // Code is highlighted by the upstream highlighter until this one is set, e.g. while it is loading.
    readonly highlightCode?: HighlightCodeFn | undefined;
  }) => {
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
        highlightCode: highlightCode ? safeHighlightCode : previousCodeHighlighter
      }),
      [highlightCode, previousCodeHighlighter, safeHighlightCode]
    );

    return <Provider value={CodeHighlighterContextValue}>{children}</Provider>;
  };

export default createCodeHighlighterComposer;
