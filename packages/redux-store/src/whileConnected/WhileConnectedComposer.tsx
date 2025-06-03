import {
  CONNECT_FULFILLING,
  DISCONNECT_PENDING,
  RECONNECT_FULFILLING,
  RECONNECT_PENDING
} from 'botframework-webchat-core/internal';
import { createBitContext, useReadonlyState } from 'botframework-webchat-react-context';
import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { wrapWith } from 'react-wrap-with';
import { type Action } from 'redux';
import { useRefFrom } from 'use-ref-from';
import { object, optional, parse, pipe, readonly, type InferInput } from 'valibot';

import reduxStoreSchema from '../private/reduxStoreSchema';
import { connectionDetailsSchema, type ConnectionDetails } from './ConnectionDetails';
import WhileConnectedContext, { type WhileConnectedContextType } from './private/WhileConnectedContext';

const whileConnectedComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    store: reduxStoreSchema
  }),
  readonly()
);

type WhileConnectedComposerProps = InferInput<typeof whileConnectedComposerPropsSchema>;

const { Composer: ConnectionDetailsComposer, useState: useConnectionDetailsFromBit } = createBitContext<
  ConnectionDetails | undefined
>(undefined);

function WhileConnectedComposer(props: WhileConnectedComposerProps) {
  const {
    children,
    store: { dispatch }
  } = validateProps(whileConnectedComposerPropsSchema, props);

  const connectionDetailsState = useConnectionDetailsFromBit();

  const [connectionDetails, setConnectionDetails] = connectionDetailsState;

  const connectionDetailsRef = useRefFrom(connectionDetails);
  const useConnectionDetails = useReadonlyState(connectionDetailsState);

  // #region Replicate to Redux store
  const handleAction = useCallback<(action: Action) => void>(
    action => {
      if (connectionDetailsRef.current) {
        if (action.type === DISCONNECT_PENDING || action.type === RECONNECT_PENDING) {
          setConnectionDetails(undefined);
        }
      } else {
        if (action.type === CONNECT_FULFILLING || action.type === RECONNECT_FULFILLING) {
          setConnectionDetails(
            parse(connectionDetailsSchema, {
              // TODO: Add valibot to underlying action.
              directLine: (action as any).payload.directLine,
              userId: (action as any).meta.userId,
              username: (action as any).meta.username
            })
          );
        }
      }
    },
    [connectionDetailsRef, setConnectionDetails]
  );

  useEffect(() => {
    dispatch({ payload: { sink: handleAction }, type: 'WEB_CHAT_INTERNAL/REGISTER_ACTION_SINK' });

    return () => {
      dispatch({ payload: { sink: handleAction }, type: 'WEB_CHAT_INTERNAL/UNREGISTER_ACTION_SINK' });
    };
  }, [dispatch, handleAction]);
  // #endregion

  const context = useMemo<WhileConnectedContextType>(
    () => Object.freeze({ useConnectionDetails }),
    [useConnectionDetails]
  );

  return <WhileConnectedContext.Provider value={context}>{children}</WhileConnectedContext.Provider>;
}

export default wrapWith(ConnectionDetailsComposer)(memo(WhileConnectedComposer));
export { whileConnectedComposerPropsSchema, type WhileConnectedComposerProps };
