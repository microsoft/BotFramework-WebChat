import { type WebChatActivity } from 'botframework-webchat-core';
import { createContext } from 'react';

type StatusGroupingContextType = Readonly<{
  firstActivityState: readonly [WebChatActivity];
  lastActivityState: readonly [WebChatActivity];
}>;

const StatusGroupingContext = createContext<StatusGroupingContextType>(
  new Proxy({} as StatusGroupingContextType, {
    get() {
      throw new Error('botframework-webchat: This hook can only be used under <StatusGroupingContext>');
    }
  })
);

export default StatusGroupingContext;
export { type StatusGroupingContextType };
