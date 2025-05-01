import { type WebChatActivity } from 'botframework-webchat-core';
import { createContext, type ReactNode } from 'react';

type SenderGroupingContextType = Readonly<{
  firstActivityState: readonly [WebChatActivity];
  lastActivityState: readonly [WebChatActivity];
  renderAvatar: false | (() => Exclude<ReactNode, boolean | null | undefined>);
}>;

const SenderGroupingContext = createContext<SenderGroupingContextType>(
  new Proxy({} as SenderGroupingContextType, {
    get() {
      throw new Error('botframework-webchat: This hook can only be used under <SenderGroupingContext>');
    }
  })
);

export default SenderGroupingContext;
export { type SenderGroupingContextType };
