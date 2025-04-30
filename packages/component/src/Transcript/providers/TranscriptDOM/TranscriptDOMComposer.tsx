import React, { memo, useMemo, useRef, type ReactNode } from 'react';
import TranscriptDOMContext, { type TranscriptDOMContextType } from './private/TranscriptDOMContext';

type TranscriptDOMComposerProps = Readonly<{
  children?: ReactNode | undefined;
}>;

const TranscriptDOMComposer = ({ children }: TranscriptDOMComposerProps) => {
  const activityElementRef = useRef<Map<string, HTMLElement>>(new Map());
  const context = useMemo<TranscriptDOMContextType>(() => ({ activityElementRef }), [activityElementRef]);

  return <TranscriptDOMContext.Provider value={context}>{children}</TranscriptDOMContext.Provider>;
};

export default memo(TranscriptDOMComposer);
export { type TranscriptDOMComposerProps };
