import { GraphProvider } from '@msinternal/botframework-webchat-api-graph';
import { SuggestedActionsComposer } from '@msinternal/botframework-webchat-redux-store';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { createActivitiesStore, type ActivitiesStore } from 'botframework-webchat-core/activities.js';
import React, { memo, useEffect, useMemo } from 'react';
import { custom, function_, is, object, optional, pipe, readonly, type InferInput } from 'valibot';

import usePonyfill from '../../hooks/usePonyfill';
import DefaultDomainPlaceholders from './DefaultDomainPlaceholders';
import createGraphStoreFromActivitiesStore from './private/createGraphStoreFromActivitiesStore';
import { warnIncompleteOnce } from './private/warnPlaceholderOnce';

const defaultProvidersPropsSchema = pipe(
  object({
    /** For tests: the activities store to read, instead of one created on mount. */
    activitiesStore: optional(
      custom<ActivitiesStore>(value => is(object({ getSnapshot: function_(), subscribe: function_() }), value))
    ),
    children: optional(reactNode())
  }),
  readonly()
);

type DefaultProvidersProps = InferInput<typeof defaultProvidersPropsSchema>;

/**
 * The providers of `<Composer>` without Redux: suggested actions, activities from the activities store, and the domain
 * contexts. Internal and for tests only, until every domain is built: the domains not built yet are placeholders.
 */
function DefaultProviders(props: DefaultProvidersProps) {
  const { activitiesStore: activitiesStoreFromProps, children } = validateProps(defaultProvidersPropsSchema, props);
  const [ponyfill] = usePonyfill();

  // As the Redux store that <Composer> creates: one per ponyfill, which cannot change after the first render.
  const activitiesStore = useMemo<ActivitiesStore>(
    () => activitiesStoreFromProps || createActivitiesStore({ ponyfill }),
    [activitiesStoreFromProps, ponyfill]
  );

  const graphStore = useMemo(() => createGraphStoreFromActivitiesStore(activitiesStore), [activitiesStore]);

  useEffect(() => warnIncompleteOnce(), []);

  return (
    <SuggestedActionsComposer>
      <GraphProvider store={graphStore}>
        <DefaultDomainPlaceholders>{children}</DefaultDomainPlaceholders>
      </GraphProvider>
    </SuggestedActionsComposer>
  );
}

DefaultProviders.displayName = 'DefaultProviders';

export default memo(DefaultProviders);
export { defaultProvidersPropsSchema, type DefaultProvidersProps };
