import type { DirectLineActivityNode } from '@msinternal/botframework-webchat-core-graph';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { createStore, WebChatActivity } from 'botframework-webchat-core';
import {
  createGraphFromStore,
  isOfType,
  type GraphSubscriber,
  type Identifier,
  type SlantNode
} from 'botframework-webchat-core/graph';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { custom, function_, object, optional, pipe, readonly, safeParse, type InferInput } from 'valibot';

import GraphContext, { type GraphContextType } from './GraphContext';

const EMPTY_ARRAY = Object.freeze([]);

const INITIAL_CONTEXT: GraphContextType = {
  orderedActivitiesState: Object.freeze([EMPTY_ARRAY] as const),
  orderedMessageNodesState: Object.freeze([EMPTY_ARRAY] as const),
  readonlyGraphState: Object.freeze([new Map<Identifier, SlantNode>()])
};

const graphProviderPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    store: custom<ReturnType<typeof createStore>>(
      value => safeParse(object({ getState: function_(), subscribe: function_() }), value).success
    )
  }),
  readonly()
);

type GraphProviderProps = InferInput<typeof graphProviderPropsSchema>;

function GraphProvider(props: GraphProviderProps) {
  const { children, store } = validateProps(graphProviderPropsSchema, props);

  const graph = useMemo(() => createGraphFromStore(store), [store]);
  const [context, setContext] = useState<GraphContextType>(INITIAL_CONTEXT);

  useEffect(() => {
    // Sync between graph and `orderedActivities`/`orderedMessages`.
    const handleChange: GraphSubscriber = record => {
      const state = graph.getState();

      setContext(context => {
        const [prevOrderedActivities] = context.orderedMessageNodesState;
        let nextOrderedMessageMap: Map<Identifier, DirectLineActivityNode> | undefined;

        for (const id of record.upsertedNodeIdentifiers) {
          const node = state.get(id);

          if (node && isOfType(node, 'urn:microsoft:webchat:direct-line-activity')) {
            const activityNode = node as DirectLineActivityNode;

            if (!nextOrderedMessageMap) {
              nextOrderedMessageMap = new Map(prevOrderedActivities.map(node => [node['@id'], node]));
            }

            const permanentId = activityNode['@id'];

            nextOrderedMessageMap.delete(permanentId);
            nextOrderedMessageMap.set(permanentId, activityNode);
          }
        }

        const orderedMessages: readonly DirectLineActivityNode[] = nextOrderedMessageMap
          ? // TODO: [P0] Insertion sort is cheaper by 20x if inserting 1 activity into a list of 1,000 activities.
            Object.freeze(Array.from(nextOrderedMessageMap.values()).sort((x, y) => x.position[0] - y.position[0]))
          : prevOrderedActivities;

        const orderedActivities: readonly WebChatActivity[] = orderedMessages.map(
          node => node['urn:microsoft:webchat:direct-line-activity:raw-json'][0]['@value'] as WebChatActivity
        );

        return Object.freeze({
          orderedActivitiesState: Object.freeze([orderedActivities]),
          orderedMessageNodesState: Object.freeze([orderedMessages]),
          readonlyGraphState: Object.freeze([state])
        } satisfies GraphContextType);
      });
    };

    const unsubscribe = graph.subscribe(handleChange);

    // Triggers initial sync.
    // Activities queued before Web Chat mounted should be synchronized.
    handleChange({ upsertedNodeIdentifiers: new Set(graph.getState().keys()) });

    return () => {
      unsubscribe();
      setContext(INITIAL_CONTEXT);
    };
  }, [graph, setContext]);

  return <GraphContext.Provider value={context}>{children}</GraphContext.Provider>;
}

GraphProvider.displayName = 'GraphProvider';

export default memo(GraphProvider);
export { graphProviderPropsSchema, type GraphProviderProps };
