import React, { memo, type ReactNode } from 'react';

import { type Notification } from '../../../types/Notification';
import createSliceContext from './private/createSliceContext';

const [ConnectivityStatusContext, useConnectivityStatusSlice] = createSliceContext<string>(
  'WebChatConnectivityStatusContext'
);

// Keyed by ID, as the `notifications` slice of the Redux store.
const [NotificationsSliceContext, useNotificationsSlice] = createSliceContext<Notification[]>(
  'WebChatNotificationsSliceContext'
);

// As the Redux store: `null` until Direct Line has a reference grammar ID.
const [ReferenceGrammarIDContext, useReferenceGrammarIDSlice] = createSliceContext<string>(
  'WebChatReferenceGrammarIDContext'
);

type ConnectionSlicesProps = {
  readonly children?: ReactNode | undefined;
  readonly connectivityStatus: string;
  readonly notifications: Notification[];
  readonly referenceGrammarID: string;
};

/**
 * The slices of the connection group: connectivity status, notifications and reference grammar ID, one context each, so
 * a hook re-renders only when its slice changes. Both provider sets render it, with the values of their state.
 */
function ConnectionSlicesProvider({
  children,
  connectivityStatus,
  notifications,
  referenceGrammarID
}: ConnectionSlicesProps) {
  return (
    <ConnectivityStatusContext.Provider value={connectivityStatus}>
      <NotificationsSliceContext.Provider value={notifications}>
        <ReferenceGrammarIDContext.Provider value={referenceGrammarID}>{children}</ReferenceGrammarIDContext.Provider>
      </NotificationsSliceContext.Provider>
    </ConnectivityStatusContext.Provider>
  );
}

ConnectionSlicesProvider.displayName = 'ConnectionSlicesProvider';

const ConnectionSlices = memo(ConnectionSlicesProvider);

export default ConnectionSlices;
export { useConnectivityStatusSlice, useNotificationsSlice, useReferenceGrammarIDSlice, type ConnectionSlicesProps };
