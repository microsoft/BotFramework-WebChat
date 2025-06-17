import {
  CONNECT_FULFILLING,
  DISCONNECT_PENDING,
  RECONNECT_FULFILLING,
  RECONNECT_PENDING
} from 'botframework-webchat-core/internal';
import { createBitContext, useReadonlyState } from 'botframework-webchat-react-context';
import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import React, { memo, useCallback, useMemo } from 'react';
import { wrapWith } from 'react-wrap-with';
import { type Action } from 'redux';
import { useRefFrom } from 'use-ref-from';
import { object, optional, pipe, readonly, safeParse, type InferInput } from 'valibot';

import reduxStoreSchema from '../private/reduxStoreSchema';
import ReduxActionSinkComposer from '../reduxActionSink/ReduxActionSinkComposer';
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
  const { children, store } = validateProps(whileConnectedComposerPropsSchema, props);

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
          const result = safeParse(connectionDetailsSchema, {
            // TODO: Add valibot to underlying action.
            directLine: (action as any).payload.directLine,
            userId: (action as any).meta.userId,
            username: (action as any).meta.username
          });

          if (result.success) {
            setConnectionDetails(result.output);
          } else {
            console.warn(
              `botframework-webchat: Received action of type "${action.type}" but its content is not valid, ignoring.`,
              { result }
            );
          }
        }
      }
    },
    [connectionDetailsRef, setConnectionDetails]
  );
  // #endregion

  const context = useMemo<WhileConnectedContextType>(
    () => Object.freeze({ useConnectionDetails }),
    [useConnectionDetails]
  );

  return (
    <ReduxActionSinkComposer onAction={handleAction} store={store}>
      <WhileConnectedContext.Provider value={context}>{children}</WhileConnectedContext.Provider>
    </ReduxActionSinkComposer>
  );
}

export default wrapWith(ConnectionDetailsComposer)(memo(WhileConnectedComposer));
export { whileConnectedComposerPropsSchema, type WhileConnectedComposerProps };
