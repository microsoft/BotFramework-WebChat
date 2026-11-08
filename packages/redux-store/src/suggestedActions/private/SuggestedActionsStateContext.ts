import { type DirectLineCardAction, type WebChatActivity } from 'botframework-webchat-core';
import { createContext, type Dispatch, type SetStateAction } from 'react';

/**
 * The state of `<SuggestedActionsComposer>` and its raw setters, for `<ReduxSuggestedActionsMirror>` only.
 */
type SuggestedActionsStateContextType = {
  readonly originActivity: WebChatActivity | undefined;
  readonly setOriginActivity: Dispatch<SetStateAction<WebChatActivity | undefined>>;
  readonly setSuggestedActionsRaw: Dispatch<SetStateAction<readonly DirectLineCardAction[]>>;
  readonly suggestedActions: readonly DirectLineCardAction[];
};

const SuggestedActionsStateContext = createContext<SuggestedActionsStateContextType>(
  new Proxy({} as SuggestedActionsStateContextType, {
    get() {
      throw new Error('botframework-webchat: This hook can only be used under <SuggestedActionsComposer>');
    }
  })
);

export default SuggestedActionsStateContext;
export { type SuggestedActionsStateContextType };
