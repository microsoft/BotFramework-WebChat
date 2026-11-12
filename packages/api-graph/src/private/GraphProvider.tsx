import type { DirectLineActivityNode } from '@msinternal/botframework-webchat-core-graph';
import { useSyncExternalStore } from '@msinternal/botframework-webchat-react-hooks';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { createStore, WebChatActivity } from 'botframework-webchat-core';
import { createGraphFromStore, isOfType, type SlantGraph } from 'botframework-webchat-core/graph.js';
import React, { memo, useCallback, useMemo } from 'react';
import { custom, function_, is, object, optional, parse, pipe, readonly, type InferInput } from 'valibot';

import GraphContext, { graphContextSchema, GraphContextType } from './GraphContext';

const EMPTY_ARRAY: readonly WebChatActivity[] = Object.freeze([]);

const graphProviderPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    store: custom<ReturnType<typeof createStore>>(value =>
      is(object({ getState: function_(), subscribe: function_() }), value)
    )
  }),
  readonly()
);

type GraphProviderProps = InferInput<typeof graphProviderPropsSchema>;

// Activities in the order of the graph, without the ones no longer in Redux: the graph does not delete nodes
// (e.g. DIRECT_LINE/DELETE_ACTIVITY or pruned livestream revisions). Returns the same array until either changes.
function createGetOrderedActivities(
  graph: SlantGraph,
  store: GraphProviderProps['store']
): () => readonly WebChatActivity[] {
  let prevGraphState: ReturnType<SlantGraph['getState']> | undefined;
  let prevStoreActivities: readonly WebChatActivity[] | undefined;
  let orderedActivities = EMPTY_ARRAY;

  return () => {
    const graphState = graph.getState();
    const { activities: storeActivities }: { activities: readonly WebChatActivity[] } = store.getState();

    if (graphState !== prevGraphState || storeActivities !== prevStoreActivities) {
      const storeActivitySet = new Set(storeActivities);

      prevGraphState = graphState;
      prevStoreActivities = storeActivities;

      // TODO: [P0] Insertion sort is cheaper by 20x if inserting 1 activity into a list of 1,000 activities.
      orderedActivities = Object.freeze(
        Array.from(graphState.values())
          .filter((node): node is DirectLineActivityNode =>
            isOfType(node, 'urn:microsoft:webchat:direct-line-activity')
          )
          .sort((x, y) => x.position[0] - y.position[0])
          .map(node => node['urn:microsoft:webchat:direct-line-activity:raw-json'][0]['@value'] as WebChatActivity)
          .filter(activity => storeActivitySet.has(activity))
      );
    }

    return orderedActivities;
  };
}

function GraphProvider(props: GraphProviderProps) {
  const { children, store } = validateProps(graphProviderPropsSchema, props);

  const graph = useMemo(() => createGraphFromStore(store), [store]);

  // Follows the graph for new and updated activities, and Redux for deleted activities.
  const subscribe = useCallback(
    (listener: () => void) => {
      const unsubscribeGraph = graph.subscribe(listener);
      const unsubscribeStore = store.subscribe(listener);

      return () => {
        unsubscribeGraph();
        unsubscribeStore();
      };
    },
    [graph, store]
  );

  const orderedActivities = useSyncExternalStore(
    subscribe,
    useMemo(() => createGetOrderedActivities(graph, store), [graph, store])
  );

  const context = useMemo<GraphContextType>(
    () =>
      parse(graphContextSchema, {
        orderedActivitiesState: Object.freeze([orderedActivities] as const)
      }),
    [orderedActivities]
  );

  return <GraphContext.Provider value={context}>{children}</GraphContext.Provider>;
}

GraphProvider.displayName = 'GraphProvider';

export default memo(GraphProvider);
export { graphProviderPropsSchema, type GraphProviderProps };
