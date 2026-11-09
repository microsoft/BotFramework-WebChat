import { GraphProvider } from '@msinternal/botframework-webchat-api-graph';
import { SuggestedActionsComposer, SuggestedActionsSubscriber } from '@msinternal/botframework-webchat-redux-store';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import {
  createActivitiesStore,
  createConnectionService,
  createIncomingService,
  createNotificationsCell,
  type ActivitiesStore,
  type Notify
} from 'botframework-webchat-core/internal.js';
import React, { memo, useEffect, useMemo } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { custom, function_, is, object, optional, pipe, readonly, type InferInput } from 'valibot';

import usePonyfill from '../../hooks/usePonyfill';
import DefaultDomainProviders from './DefaultDomainProviders';
import createGraphStoreFromActivitiesStore from './private/createGraphStoreFromActivitiesStore';
import { warnIncompleteOnce } from './private/warnPlaceholderOnce';

const defaultProvidersPropsSchema = pipe(
  object({
    /** For tests: the activities store to read, instead of one created on mount. */
    activitiesStore: optional(
      custom<ActivitiesStore>(value =>
        is(object({ getSnapshot: function_(), receiveActivity: function_(), subscribe: function_() }), value)
      )
    ),
    children: optional(reactNode())
  }),
  readonly()
);

type DefaultProvidersProps = InferInput<typeof defaultProvidersPropsSchema>;

// One change of a service notifies every hook reading it in one batch, as the Redux providers do.
// Remove `unstable_batchedUpdates()` when every supported React renders with `createRoot()`.
const notify: Notify = callListeners => unstable_batchedUpdates(callListeners);

/**
 * The providers of `<Composer>` without Redux: suggested actions, activities from the activities store, connectivity and
 * notifications from the services, and the domain contexts. Internal and for tests only, until every domain is built:
 * the domains not built yet are placeholders.
 */
function DefaultProviders(props: DefaultProvidersProps) {
  const { activitiesStore: activitiesStoreFromProps, children } = validateProps(defaultProvidersPropsSchema, props);
  const [ponyfill] = usePonyfill();

  // As the Redux store that <Composer> creates: one set per ponyfill, which cannot change after the first render.
  // Creating them does nothing else (no subscription, no timer), so the set of a discarded render is simply dropped.
  const services = useMemo(() => {
    const activitiesStore = activitiesStoreFromProps || createActivitiesStore({ ponyfill });
    const notifications = createNotificationsCell({ notify, ponyfill });
    const connection = createConnectionService({ notifications, notify, ponyfill });
    const incoming = createIncomingService({ activitiesStore, connection, ponyfill });

    return Object.freeze({ activitiesStore, connection, incoming, notifications });
  }, [activitiesStoreFromProps, ponyfill]);

  const graphStore = useMemo(
    () => createGraphStoreFromActivitiesStore(services.activitiesStore),
    [services.activitiesStore]
  );

  useEffect(() => warnIncompleteOnce(), []);

  return (
    <SuggestedActionsComposer>
      <SuggestedActionsSubscriber subscribe={services.incoming.onSuggestedActions}>
        <GraphProvider store={graphStore}>
          <DefaultDomainProviders connection={services.connection} notifications={services.notifications}>
            {children}
          </DefaultDomainProviders>
        </GraphProvider>
      </SuggestedActionsSubscriber>
    </SuggestedActionsComposer>
  );
}

DefaultProviders.displayName = 'DefaultProviders';

export default memo(DefaultProviders);
export { defaultProvidersPropsSchema, type DefaultProvidersProps };
