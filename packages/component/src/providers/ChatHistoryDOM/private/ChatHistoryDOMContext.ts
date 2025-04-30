import { createContext, type MutableRefObject } from 'react';

type ChatHistoryDOMContextType = Readonly<{
  activityElementRef: MutableRefObject<Map<string, HTMLElement>>;
}>;

const ChatHistoryDOMContext = createContext<ChatHistoryDOMContextType>(
  new Proxy({} as ChatHistoryDOMContextType, {
    get() {
      throw new Error(`botframework-webchat: This hook can only be used under <ChatHistoryDOMComposer>`);
    }
  })
);

export default ChatHistoryDOMContext;
export { type ChatHistoryDOMContextType };
