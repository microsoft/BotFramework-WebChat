import React, { memo, useMemo, useRef, type ReactNode } from 'react';
import ChatHistoryDOMContext, { type ChatHistoryDOMContextType } from './private/ChatHistoryDOMContext';

type ChatHistoryDOMComposerProps = Readonly<{
  children?: ReactNode | undefined;
}>;

const ChatHistoryDOMComposer = ({ children }: ChatHistoryDOMComposerProps) => {
  const activityElementRef = useRef<Map<string, HTMLElement>>(new Map());
  const context = useMemo<ChatHistoryDOMContextType>(() => ({ activityElementRef }), [activityElementRef]);

  return <ChatHistoryDOMContext.Provider value={context}>{children}</ChatHistoryDOMContext.Provider>;
};

ChatHistoryDOMComposer.displayName = 'ChatHistoryDOMComposer';

export default memo(ChatHistoryDOMComposer);
export { type ChatHistoryDOMComposerProps };
