import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { type ConnectionService, type NotificationsCell } from 'botframework-webchat-core/internal.js';
import React, { memo, useMemo } from 'react';
import { custom, function_, is, object, optional, pipe, readonly, type InferInput } from 'valibot';

import ConnectivityContext, { type ConnectivityContextType } from '../../hooks/internal/domains/ConnectivityContext';
import NotificationsContext, { type NotificationsContextType } from '../../hooks/internal/domains/NotificationsContext';
import DefaultDomainPlaceholders from './DefaultDomainPlaceholders';

const defaultDomainProvidersPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    connection: custom<Pick<ConnectionService, 'connectivityStatus' | 'referenceGrammarID'>>(value =>
      is(object({ connectivityStatus: object({}), referenceGrammarID: object({}) }), value)
    ),
    notifications: custom<NotificationsCell>(value =>
      is(object({ dismissNotification: function_(), notifications: object({}), setNotification: function_() }), value)
    )
  }),
  readonly()
);

type DefaultDomainProvidersProps = InferInput<typeof defaultDomainProvidersPropsSchema>;

/**
 * The domain contexts of the default providers: connectivity and notifications from the services, placeholders for the
 * domains not built yet.
 */
function DefaultDomainProviders(props: DefaultDomainProvidersProps) {
  const { children, connection, notifications } = validateProps(defaultDomainProvidersPropsSchema, props);

  const connectivityContext = useMemo<ConnectivityContextType>(
    () =>
      Object.freeze({
        connectivityStatus: connection.connectivityStatus,
        // As the Redux store: `null` until Direct Line has a reference grammar ID.
        referenceGrammarID: connection.referenceGrammarID as ConnectivityContextType['referenceGrammarID']
      }),
    [connection]
  );

  const notificationsContext = useMemo<NotificationsContextType>(
    () =>
      Object.freeze({
        dismissNotification: notifications.dismissNotification,
        // Keyed by ID, as the `notifications` slice of the Redux store.
        notifications: notifications.notifications as unknown as NotificationsContextType['notifications'],
        setNotification: notifications.setNotification
      }),
    [notifications]
  );

  return (
    <ConnectivityContext.Provider value={connectivityContext}>
      <NotificationsContext.Provider value={notificationsContext}>
        <DefaultDomainPlaceholders>{children}</DefaultDomainPlaceholders>
      </NotificationsContext.Provider>
    </ConnectivityContext.Provider>
  );
}

DefaultDomainProviders.displayName = 'DefaultDomainProviders';

export default memo(DefaultDomainProviders);
export { defaultDomainProvidersPropsSchema, type DefaultDomainProvidersProps };
