import { type DirectLineCardAction, type WebChatActivity } from 'botframework-webchat-core';
import { useContext, type Dispatch, type SetStateAction } from 'react';

import SuggestedActionsContext from './private/SuggestedActionsContext';

type SuggestedActionsHooks = Readonly<{
  useSuggestedActions: () => readonly [
    readonly DirectLineCardAction[],
    Dispatch<SetStateAction<readonly DirectLineCardAction[]>>,
    Readonly<{ activity: undefined | WebChatActivity }>
  ];
}>;

function useSuggestedActions(): ReturnType<SuggestedActionsHooks['useSuggestedActions']> {
  const { originActivity, setSuggestedActions, suggestedActions } = useContext(SuggestedActionsContext);

  return Object.freeze([suggestedActions, setSuggestedActions, Object.freeze({ activity: originActivity })] as const);
}

const SUGGESTED_ACTIONS_HOOKS: SuggestedActionsHooks = Object.freeze({ useSuggestedActions });

export default function useSuggestedActionsHooks(): SuggestedActionsHooks {
  return SUGGESTED_ACTIONS_HOOKS;
}

export { type SuggestedActionsHooks };
