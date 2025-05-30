import { type DirectLineCardAction, type WebChatActivity } from 'botframework-webchat-core';
import { createContext, type Dispatch, type SetStateAction } from 'react';

type SuggestedActionsContextType = Readonly<{
  useSuggestedActions: () => readonly [
    readonly DirectLineCardAction[],
    Dispatch<SetStateAction<readonly DirectLineCardAction[]>>,
    Readonly<{ activity: undefined | WebChatActivity }>
  ];
}>;

const SuggestedActionsContext = createContext<SuggestedActionsContextType>(
  new Proxy({} as SuggestedActionsContextType, {
    get() {
      throw new Error('botframework-webchat: This hook can only be used under <SuggestedActionsContext>');
    }
  })
);

export default SuggestedActionsContext;
export { type SuggestedActionsContextType };
