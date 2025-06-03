import {
  CLEAR_SUGGESTED_ACTIONS,
  SET_SUGGESTED_ACTIONS,
  setSuggestedActionsActionSchema,
  WebChatActivity,
  type DirectLineCardAction
} from 'botframework-webchat-core';
import {
  POST_ACTIVITY_PENDING,
  postActivityPendingActionSchema,
  setRawState
} from 'botframework-webchat-core/internal';
import { createBitContext } from 'botframework-webchat-react-context';
import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { wrapWith } from 'react-wrap-with';
import { type Action } from 'redux';
import { useRefFrom } from 'use-ref-from';
import { object, optional, pipe, readonly, safeParse, type InferInput } from 'valibot';

import reduxStoreSchema from '../private/reduxStoreSchema';
import useWhileConnectedHooks from '../whileConnected/useWhileConnectedHooks';
import SuggestedActionsContext, { type SuggestedActionsContextType } from './private/SuggestedActionsContext';

const suggestedActionsComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    store: reduxStoreSchema
  }),
  readonly()
);

type SuggestedActionsComposerProps = InferInput<typeof suggestedActionsComposerPropsSchema>;

const { Composer: OriginActivityComposer, useState: useOriginActivity } = createBitContext<WebChatActivity | undefined>(
  undefined
);

const { Composer: SuggestedActionsActivityComposer, useState: useSuggestedActionsFromBit } = createBitContext<
  readonly DirectLineCardAction[]
>(Object.freeze([]));

const EMPTY_ARRAY = Object.freeze([]);

function SuggestedActionsComposer(props: SuggestedActionsComposerProps) {
  const {
    children,
    store: { dispatch }
  } = validateProps(suggestedActionsComposerPropsSchema, props);

  const [connectionDetails] = useWhileConnectedHooks().useConnectionDetails();
  const [originActivity, setOriginActivity] = useOriginActivity();
  const [suggestedActions, setSuggestedActionsRaw] = useSuggestedActionsFromBit();
  const setSuggestedActions = useCallback<typeof setSuggestedActionsRaw>(
    suggestedActions => {
      setOriginActivity(undefined);
      setSuggestedActionsRaw(suggestedActions);
    },
    [setOriginActivity, setSuggestedActionsRaw]
  );

  const connectionDetailsRef = useRefFrom(connectionDetails);

  // #region Replicate to Redux store
  const handleAction = useCallback(
    (action: Action) => {
      if (action.type === CLEAR_SUGGESTED_ACTIONS) {
        setOriginActivity(undefined);
        setSuggestedActionsRaw(EMPTY_ARRAY);
      } else if (action.type === SET_SUGGESTED_ACTIONS) {
        const result = safeParse(setSuggestedActionsActionSchema, action);

        if (result.success) {
          const {
            payload: { originActivity, suggestedActions }
          } = result.output;

          setOriginActivity(originActivity);
          setSuggestedActionsRaw(Object.freeze(Array.from(suggestedActions)));
        }
      } else if (action.type === POST_ACTIVITY_PENDING) {
        // TODO: Add test.
        if (connectionDetailsRef.current) {
          const result = safeParse(postActivityPendingActionSchema, action);

          if (result.success) {
            setOriginActivity(undefined);
            setSuggestedActionsRaw(EMPTY_ARRAY);
          }
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
  // #endregion

  const useSuggestedActions = useCallback<SuggestedActionsContextType['useSuggestedActions']>(
    () => Object.freeze([suggestedActions, setSuggestedActions, Object.freeze({ activity: originActivity })]),
    [originActivity, setSuggestedActions, suggestedActions]
  );

  const context = useMemo<SuggestedActionsContextType>(() => ({ useSuggestedActions }), [useSuggestedActions]);

  return <SuggestedActionsContext.Provider value={context}>{children}</SuggestedActionsContext.Provider>;
}

export default wrapWith(SuggestedActionsActivityComposer)(
  wrapWith(OriginActivityComposer)(memo(SuggestedActionsComposer))
);

export { suggestedActionsComposerPropsSchema, type SuggestedActionsComposerProps };
