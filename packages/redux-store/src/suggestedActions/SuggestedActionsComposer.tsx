import { type DirectLineCardAction, type WebChatActivity } from 'botframework-webchat-core';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import SuggestedActionsContext, { type SuggestedActionsContextType } from './private/SuggestedActionsContext';
import SuggestedActionsStateContext, {
  type SuggestedActionsStateContextType
} from './private/SuggestedActionsStateContext';

const suggestedActionsComposerPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type SuggestedActionsComposerProps = InferInput<typeof suggestedActionsComposerPropsSchema>;

const EMPTY_ARRAY = Object.freeze([]);

/**
 * Owns the suggested actions. Under a Redux store, `<ReduxSuggestedActionsMirror>` mirrors them to the store.
 *
 * `useSuggestedActionsHooks().useSuggestedActions()` reads them.
 */
function SuggestedActionsComposer(props: SuggestedActionsComposerProps) {
  const { children } = validateProps(suggestedActionsComposerPropsSchema, props);

  const [originActivity, setOriginActivity] = useState<WebChatActivity | undefined>();
  const [suggestedActions, setSuggestedActionsRaw] = useState<readonly DirectLineCardAction[]>(EMPTY_ARRAY);
  const setSuggestedActions = useCallback<typeof setSuggestedActionsRaw>(
    suggestedActions => {
      setOriginActivity(undefined);
      setSuggestedActionsRaw(suggestedActions);
    },
    [setSuggestedActionsRaw]
  );

  const stateContext = useMemo<SuggestedActionsStateContextType>(
    () => Object.freeze({ originActivity, setOriginActivity, setSuggestedActionsRaw, suggestedActions }),
    [originActivity, setOriginActivity, setSuggestedActionsRaw, suggestedActions]
  );

  const context = useMemo<SuggestedActionsContextType>(
    () => Object.freeze({ originActivity, setSuggestedActions, suggestedActions }),
    [originActivity, setSuggestedActions, suggestedActions]
  );

  return (
    <SuggestedActionsStateContext.Provider value={stateContext}>
      <SuggestedActionsContext.Provider value={context}>{children}</SuggestedActionsContext.Provider>
    </SuggestedActionsStateContext.Provider>
  );
}

SuggestedActionsComposer.displayName = 'SuggestedActionsComposer';

export default memo(SuggestedActionsComposer);
export { suggestedActionsComposerPropsSchema, type SuggestedActionsComposerProps };
