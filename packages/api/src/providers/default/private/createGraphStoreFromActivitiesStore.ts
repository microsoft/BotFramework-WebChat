import { type GraphProvider } from '@msinternal/botframework-webchat-api-graph';
import { type ActivitiesStore } from 'botframework-webchat-core/internal.js';
import { type ComponentProps } from 'react';

type GraphProviderStore = ComponentProps<typeof GraphProvider>['store'];

/**
 * The activities store, as the store that `<GraphProvider>` reads: `getState().activities` and `subscribe()`.
 *
 * `sortedActivities` keeps its identity until the next change, and the activities store notifies once the state is
 * derived, so the graph never reads an older list.
 */
export default function createGraphStoreFromActivitiesStore(activitiesStore: ActivitiesStore): GraphProviderStore {
  const graphStore = Object.freeze({
    getState: () => Object.freeze({ activities: activitiesStore.getSnapshot().sortedActivities }),
    subscribe: (listener: () => void) => activitiesStore.subscribe(() => listener())
  });

  // <GraphProvider> types its store as the Redux store, but reads only `getState().activities` and `subscribe()`.
  return graphStore as unknown as GraphProviderStore;
}
