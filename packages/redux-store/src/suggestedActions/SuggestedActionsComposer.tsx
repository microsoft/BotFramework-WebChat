import {
  CLEAR_SUGGESTED_ACTIONS,
  SET_SUGGESTED_ACTIONS,
  setSuggestedActionsActionSchema,
  WebChatActivity,
  type DirectLineCardAction
} from 'botframework-webchat-core';
import { setRawState } from 'botframework-webchat-core/internal.js';
import { useSyncExternalStore } from '@msinternal/botframework-webchat-react-hooks';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, type SetStateAction } from 'react';
import { type Action } from 'redux';
import { object, optional, pipe, readonly, safeParse, type InferInput } from 'valibot';

import reduxStoreSchema from '../private/reduxStoreSchema';
import SuggestedActionsContext, { type SuggestedActionsContextType } from './private/SuggestedActionsContext';

const suggestedActionsComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    store: reduxStoreSchema
  }),
  readonly()
);

type SuggestedActionsComposerProps = InferInput<typeof suggestedActionsComposerPropsSchema>;

const EMPTY_ARRAY = Object.freeze([]);

type SuggestedActionsState = Readonly<{
  originActivity: WebChatActivity | undefined;
  suggestedActions: readonly DirectLineCardAction[];
}>;

const INITIAL_STATE: SuggestedActionsState = Object.freeze({
  originActivity: undefined,
  suggestedActions: EMPTY_ARRAY
});

/** Creates a store of the suggested actions. Listeners may re-render: call `setState()` outside of rendering. */
function createSuggestedActionsStore() {
  const listeners = new Set<() => void>();
  let state = INITIAL_STATE;

  return Object.freeze({
    getState: () => state,
    setState: (nextState: SuggestedActionsState) => {
      state = nextState;

      listeners.forEach(listener => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    }
  });
}

function SuggestedActionsComposer(props: SuggestedActionsComposerProps) {
  const {
    children,
    store: { dispatch }
  } = validateProps(suggestedActionsComposerPropsSchema, props);

  // A store, not a state: the action sink runs while the store dispatches the activity, which re-renders at sync priority
  // on React 18 and later. A state would render later, the activity would show before its suggested actions.
  const suggestedActionsStore = useMemo(createSuggestedActionsStore, []);
  const { originActivity, suggestedActions } = useSyncExternalStore(
    suggestedActionsStore.subscribe,
    suggestedActionsStore.getState
  );

  const setSuggestedActions = useCallback(
    (suggestedActions: SetStateAction<readonly DirectLineCardAction[]>) =>
      suggestedActionsStore.setState(
        Object.freeze({
          originActivity: undefined,
          suggestedActions:
            typeof suggestedActions === 'function'
              ? suggestedActions(suggestedActionsStore.getState().suggestedActions)
              : suggestedActions
        })
      ),
    [suggestedActionsStore]
  );

  // #region Replicate to Redux store
  const handleAction = useCallback(
    (action: Action) => {
      if (action.type === CLEAR_SUGGESTED_ACTIONS) {
        suggestedActionsStore.setState(INITIAL_STATE);
      } else if (action.type === SET_SUGGESTED_ACTIONS) {
        const result = safeParse(setSuggestedActionsActionSchema, action);

        if (result.success) {
          const {
            payload: { originActivity, suggestedActions }
          } = result.output;

          suggestedActionsStore.setState(
            Object.freeze({ originActivity, suggestedActions: Object.freeze(Array.from(suggestedActions)) })
          );
        }
      }
    },
    [suggestedActionsStore]
  );

  // Layout effects: the store has them by the time they show.
  useLayoutEffect(() => {
    dispatch(setRawState('suggestedActions', suggestedActions));
  }, [dispatch, suggestedActions]);
  useLayoutEffect(() => {
    dispatch(setRawState('suggestedActionsOriginActivity', { activity: originActivity }));
  }, [dispatch, originActivity]);

  useEffect(() => {
    dispatch({ payload: { sink: handleAction }, type: 'WEB_CHAT_INTERNAL/REGISTER_ACTION_SINK' });

    return () => {
      dispatch({ payload: { sink: handleAction }, type: 'WEB_CHAT_INTERNAL/UNREGISTER_ACTION_SINK' });
    };
  }, [dispatch, handleAction]);
  // #endregion

  const useSuggestedActions = useCallback<SuggestedActionsContextType['useSuggestedActions']>(
    () => Object.freeze([suggestedActions, setSuggestedActions, Object.freeze({ activity: originActivity })]),
    [originActivity, setSuggestedActions, suggestedActions]
  );

  const context = useMemo<SuggestedActionsContextType>(() => ({ useSuggestedActions }), [useSuggestedActions]);

  return <SuggestedActionsContext.Provider value={context}>{children}</SuggestedActionsContext.Provider>;
}

export default memo(SuggestedActionsComposer);
export { suggestedActionsComposerPropsSchema, type SuggestedActionsComposerProps };
