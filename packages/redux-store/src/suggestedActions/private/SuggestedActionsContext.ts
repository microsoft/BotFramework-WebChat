import { type DirectLineCardAction, type WebChatActivity } from 'botframework-webchat-core';
import { createContext, type Dispatch, type SetStateAction } from 'react';

/**
 * The suggested actions of `<SuggestedActionsComposer>`, the activity they came from, and a setter.
 */
type SuggestedActionsContextType = Readonly<{
  originActivity: WebChatActivity | undefined;
  /** Sets the suggested actions, without an origin activity. */
  setSuggestedActions: Dispatch<SetStateAction<readonly DirectLineCardAction[]>>;
  suggestedActions: readonly DirectLineCardAction[];
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
