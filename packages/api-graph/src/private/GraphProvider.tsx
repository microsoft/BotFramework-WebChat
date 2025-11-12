import type { DirectLineActivityNode } from '@msinternal/botframework-webchat-core-graph';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { createStore, WebChatActivity } from 'botframework-webchat-core';
import { createGraphFromStore, isOfType, type GraphSubscriber, type Identifier } from 'botframework-webchat-core/graph';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { custom, function_, object, optional, parse, pipe, readonly, safeParse, type InferInput } from 'valibot';

import GraphContext, { graphContextSchema, GraphContextType } from './GraphContext';

const EMPTY_ARRAY = Object.freeze([]);

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

  const [orderedActivityNodes, setOrderedActivityNodes] = useState<readonly DirectLineActivityNode[]>(EMPTY_ARRAY);

  useEffect(() => {
    // Sync between graph and `orderedActivities`.
    const handleChange: GraphSubscriber = record => {
      const state = graph.getState();

      setOrderedActivityNodes(prevOrderedMessages => {
        let nextOrderedMessageMap: Map<Identifier, DirectLineActivityNode> | undefined;

        for (const id of record.upsertedNodeIdentifiers) {
          const node = state.get(id);

          if (node && isOfType(node, 'urn:microsoft:webchat:direct-line-activity')) {
            const activityNode = node as DirectLineActivityNode;

            if (!nextOrderedMessageMap) {
              nextOrderedMessageMap = new Map(prevOrderedMessages.map(node => [node['@id'], node]));
            }

            const permanentId = activityNode['@id'];

            nextOrderedMessageMap.delete(permanentId);
            nextOrderedMessageMap.set(permanentId, activityNode);
          }
        }

        if (nextOrderedMessageMap) {
          // TODO: [P0] Insertion sort is cheaper by 20x if inserting 1 activity into a list of 1,000 activities.
          return Object.freeze(
            Array.from(nextOrderedMessageMap.values()).sort((x, y) => x.position[0] - y.position[0])
          );
        }

        return prevOrderedMessages;
      });
    };

    const unsubscribe = graph.subscribe(handleChange);

    // Triggers initial sync.
    // Activities queued before Web Chat mounted should be synchronized.
    handleChange({ upsertedNodeIdentifiers: new Set(graph.getState().keys()) });

    return () => {
      unsubscribe();
      setOrderedActivityNodes(EMPTY_ARRAY);
    };
  }, [graph, setOrderedActivityNodes]);

  const orderedActivitiesState = useMemo<readonly [readonly WebChatActivity[]]>(
    () =>
      Object.freeze([
        Object.freeze(
          orderedActivityNodes.map(
            node => node['urn:microsoft:webchat:direct-line-activity:raw-json'][0]['@value'] as WebChatActivity
          )
        )
      ] as const),
    [orderedActivityNodes]
  );

  const context = useMemo<GraphContextType>(
    () =>
      parse(graphContextSchema, {
        orderedActivitiesState
      }),
    [orderedActivitiesState]
  );

  return <GraphContext.Provider value={context}>{children}</GraphContext.Provider>;
}

GraphProvider.displayName = 'GraphProvider';

export default memo(GraphProvider);
export { graphProviderPropsSchema, type GraphProviderProps };
