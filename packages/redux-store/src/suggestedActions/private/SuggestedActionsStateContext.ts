import { type DirectLineCardAction, type WebChatActivity } from 'botframework-webchat-core';
import { createContext } from 'react';

type SuggestedActionsState = Readonly<{
  originActivity: WebChatActivity | undefined;
  suggestedActions: readonly DirectLineCardAction[];
}>;

/**
 * The state of `<SuggestedActionsComposer>` and its raw setter, for `<ReduxSuggestedActionsMirror>` and
 * `<SuggestedActionsSubscriber>` only.
 */
type SuggestedActionsStateContextType = SuggestedActionsState & {
  /** Sets both values in one change, so their readers re-render once. */
  readonly setState: (state: SuggestedActionsState) => void;
};

const SuggestedActionsStateContext = createContext<SuggestedActionsStateContextType>(
  new Proxy({} as SuggestedActionsStateContextType, {
    get() {
      throw new Error('botframework-webchat: This hook can only be used under <SuggestedActionsComposer>');
    }
  })
);

export default SuggestedActionsStateContext;
export { type SuggestedActionsState, type SuggestedActionsStateContextType };
