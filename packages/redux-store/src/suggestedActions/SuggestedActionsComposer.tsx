import { type DirectLineCardAction } from 'botframework-webchat-core';
import { createKeyedStore, useKeyedStoreValue } from '@msinternal/botframework-webchat-react-hooks';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useCallback, useMemo, type SetStateAction } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import SuggestedActionsContext, { type SuggestedActionsContextType } from './private/SuggestedActionsContext';
import SuggestedActionsStateContext, {
  type SuggestedActionsState,
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

const INITIAL_STATE: SuggestedActionsState = Object.freeze({
  originActivity: undefined,
  suggestedActions: EMPTY_ARRAY
});

/**
 * Owns the suggested actions. Under a Redux store, `<ReduxSuggestedActionsMirror>` mirrors them to the store.
 *
 * `useSuggestedActionsHooks().useSuggestedActions()` reads them.
 */
function SuggestedActionsComposer(props: SuggestedActionsComposerProps) {
  const { children } = validateProps(suggestedActionsComposerPropsSchema, props);

  // A store, not a state: the action sink runs while the store dispatches the activity, which re-renders at sync priority
  // on React 18 and later. A state would render later, the activity would show before its suggested actions.
  const suggestedActionsStore = useMemo(() => createKeyedStore<SuggestedActionsState>(), []);
  const [state = INITIAL_STATE] = useKeyedStoreValue(suggestedActionsStore, 'state');
  const { originActivity, suggestedActions } = state;

  // Keeps the state when both values are the same, as two `useState()` did: no re-render.
  const setState = useCallback<SuggestedActionsStateContextType['setState']>(
    next => {
      const current = suggestedActionsStore.get('state') ?? INITIAL_STATE;

      (Object.is(current.originActivity, next.originActivity) &&
        Object.is(current.suggestedActions, next.suggestedActions)) ||
        suggestedActionsStore.set('state', Object.freeze({ ...next }));
    },
    [suggestedActionsStore]
  );

  const setSuggestedActions = useCallback(
    (suggestedActions: SetStateAction<readonly DirectLineCardAction[]>) =>
      setState({
        originActivity: undefined,
        suggestedActions:
          typeof suggestedActions === 'function'
            ? suggestedActions((suggestedActionsStore.get('state') ?? INITIAL_STATE).suggestedActions)
            : suggestedActions
      }),
    [setState, suggestedActionsStore]
  );

  const stateContext = useMemo<SuggestedActionsStateContextType>(
    () => Object.freeze({ originActivity, setState, suggestedActions }),
    [originActivity, setState, suggestedActions]
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
