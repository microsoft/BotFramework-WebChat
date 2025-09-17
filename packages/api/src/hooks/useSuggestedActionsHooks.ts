// tsup wrongly included typings from private packages marked as `noExternal` or `devDependencies`.
// We cannot direct re-export from private packages without rebuilding their types.
// tsup bug: https://github.com/egoist/tsup/issues/1071

import { useSuggestedActionsHooks as useSuggestedActionsHooks_ } from '@msinternal/botframework-webchat-redux-store';
import { type DirectLineCardAction, type WebChatActivity } from 'botframework-webchat-core';
import { type Dispatch, type SetStateAction } from 'react';

type SuggestedActionsContextType = Readonly<{
  useSuggestedActions: () => readonly [
    readonly DirectLineCardAction[],
    Dispatch<SetStateAction<readonly DirectLineCardAction[]>>,
    Readonly<{
      activity: undefined | WebChatActivity;
    }>
  ];
}>;

const useSuggestedActionsHooks = useSuggestedActionsHooks_ as () => SuggestedActionsContextType;

export default useSuggestedActionsHooks;
