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

import type { DirectLineActivityNode } from '@msinternal/botframework-webchat-core-graph';
import GraphContext, { GraphContextType } from './GraphContext';

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

  const [nodeMap, setNodeMap] = useState<ReadonlyMap<Identifier, SlantNode>>(() => Object.freeze(new Map()));
  const [orderedActivities, setOrderedActivities] = useState<readonly DirectLineActivityNode[]>(Object.freeze([]));

  useEffect(() => {
    // console.log('📰📰📰 GraphProvider.subscribe');

    const handleChange: GraphSubscriber = record => {
      // console.log('📰📰📰 GraphProvider.handleChange', { record });

      const state = graph.getState();

      setOrderedActivities(prevOrderedMessages => {
        let nextOrderedMessages: DirectLineActivityNode[] | undefined;

        for (const id of record.upsertedNodeIdentifiers) {
          const node = state.get(id);

          if (node && isOfType(node, 'urn:microsoft:webchat:direct-line-activity')) {
            const activity = node as DirectLineActivityNode;

            nextOrderedMessages ||= Array.from(prevOrderedMessages);
            nextOrderedMessages.push(activity);
          }
        }

        if (nextOrderedMessages) {
          // TODO: [P0] Insertion sort is cheaper by 20x.
          nextOrderedMessages.sort((x, y) => x.position[0] - y.position[0]);

          return Object.freeze(nextOrderedMessages);
        }

        return prevOrderedMessages;
      });
    };

    const unsubscribe = graph.subscribe(handleChange);

    // TODO: [P*] Should include everything in the graph.
    handleChange({ upsertedNodeIdentifiers: new Set(graph.getState().keys()) });

    return unsubscribe;
  }, [graph, setNodeMap, setOrderedActivities]);

  const orderedActivitiesState = useMemo<readonly [readonly WebChatActivity[]]>(
    () =>
      Object.freeze([
        Object.freeze(
          orderedActivities.map(
            node => node['urn:microsoft:webchat:direct-line-activity:raw-json'][0]['@value'] as WebChatActivity
          )
        )
      ] as const),
    [orderedActivities]
  );

  // useMemo(() => {
  //   // eslint-disable-next-line no-console
  //   console.log('🐛🐛🐛 GraphProvider', { orderedActivities });
  // }, [orderedActivities]);

  const context = useMemo<GraphContextType>(
    () =>
      Object.freeze({
        nodeMap,
        orderedActivitiesState
      }),
    [nodeMap, orderedActivitiesState]
  );

  return <GraphContext.Provider value={context}>{children}</GraphContext.Provider>;
}

GraphProvider.displayName = 'GraphProvider';

export default memo(GraphProvider);
export { graphProviderPropsSchema, type GraphProviderProps };
