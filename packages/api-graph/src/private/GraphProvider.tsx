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
  const [orderedMessages, setOrderedMessages] = useState<readonly DirectLineActivityNode[]>(Object.freeze([]));

  useEffect(() => {
    const handleChange: GraphSubscriber = record => {
      const state = graph.getState();

      setOrderedMessages(prevOrderedMessages => {
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

    return graph.subscribe(handleChange);
  }, [graph, setNodeMap, setOrderedMessages]);

  const orderedActivitiesState = useMemo<readonly [readonly WebChatActivity[]]>(
    () =>
      Object.freeze([
        Object.freeze(
          orderedMessages.map(
            node => node['urn:microsoft:webchat:direct-line-activity:raw-json'][0]['@value'] as WebChatActivity
          )
        )
      ] as const),
    [orderedMessages]
  );

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
