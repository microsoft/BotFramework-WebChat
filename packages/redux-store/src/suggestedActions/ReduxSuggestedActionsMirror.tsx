import {
  CLEAR_SUGGESTED_ACTIONS,
  SET_SUGGESTED_ACTIONS,
  setSuggestedActionsActionSchema
} from 'botframework-webchat-core';
import { setRawState } from 'botframework-webchat-core/internal.js';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { Fragment, memo, useCallback, useContext, useEffect, useMemo } from 'react';
import { type Action } from 'redux';
import { object, optional, pipe, readonly, safeParse, type InferInput } from 'valibot';

import reduxStoreSchema from '../private/reduxStoreSchema';
import CLEARED_SUGGESTED_ACTIONS from './CLEARED_SUGGESTED_ACTIONS';
import SuggestedActionsStateContext from './private/SuggestedActionsStateContext';

const reduxSuggestedActionsMirrorPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    store: reduxStoreSchema
  }),
  readonly()
);

type ReduxSuggestedActionsMirrorProps = InferInput<typeof reduxSuggestedActionsMirrorPropsSchema>;

/**
 * Mirrors the suggested actions of `<SuggestedActionsComposer>` to the Redux store, and applies the set and clear
 * suggested actions actions dispatched to the store.
 *
 * Wrap the children of `<SuggestedActionsComposer>` with it: it writes to the store before its children render, and
 * registers the action sink after their effects, as `<SuggestedActionsComposer>` did when it held the store.
 */
function ReduxSuggestedActionsMirror(props: ReduxSuggestedActionsMirrorProps) {
  const {
    children,
    store: { dispatch }
  } = validateProps(reduxSuggestedActionsMirrorPropsSchema, props);

  const { originActivity, setOriginActivity, setSuggestedActionsRaw, suggestedActions } =
    useContext(SuggestedActionsStateContext);

  const handleAction = useCallback(
    (action: Action) => {
      if (action.type === CLEAR_SUGGESTED_ACTIONS) {
        setOriginActivity(undefined);
        setSuggestedActionsRaw(CLEARED_SUGGESTED_ACTIONS);
      } else if (action.type === SET_SUGGESTED_ACTIONS) {
        const result = safeParse(setSuggestedActionsActionSchema, action);

        if (result.success) {
          const {
            payload: { originActivity, suggestedActions }
          } = result.output;

          setOriginActivity(originActivity);
          setSuggestedActionsRaw(Object.freeze(Array.from(suggestedActions)));
        }
      }
    },
    [setOriginActivity, setSuggestedActionsRaw]
  );

  useMemo(() => dispatch(setRawState('suggestedActions', suggestedActions)), [dispatch, suggestedActions]);
  useMemo(
    () => dispatch(setRawState('suggestedActionsOriginActivity', { activity: originActivity })),
    [dispatch, originActivity]
  );

  useEffect(() => {
    dispatch({ payload: { sink: handleAction }, type: 'WEB_CHAT_INTERNAL/REGISTER_ACTION_SINK' });

    return () => {
      dispatch({ payload: { sink: handleAction }, type: 'WEB_CHAT_INTERNAL/UNREGISTER_ACTION_SINK' });
    };
  }, [dispatch, handleAction]);

  return <Fragment>{children}</Fragment>;
}

ReduxSuggestedActionsMirror.displayName = 'ReduxSuggestedActionsMirror';

export default memo(ReduxSuggestedActionsMirror);
export { reduxSuggestedActionsMirrorPropsSchema, type ReduxSuggestedActionsMirrorProps };
