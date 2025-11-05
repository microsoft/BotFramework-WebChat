import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { createStore, WebChatActivity } from 'botframework-webchat-core';
import {
  createGraphFromStore,
  isOfType,
  type Identifier,
  type MessageNode,
  type SlantNode
} from 'botframework-webchat-core/graph';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { useRefFrom } from 'use-ref-from';
import { custom, function_, object, optional, pipe, readonly, safeParse, type InferInput } from 'valibot';

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

  // const getSnapshot = useCallback(() => {
  //   console.log('%%%%%%%%%%%%%%%%%% getSnapshot');

  //   return graph.snapshot();
  // }, [graph]);

  // const subscribe = useCallback<(onStoreChange: () => void) => () => void>(
  //   onStoreChange => {
  //     console.log('***************2 start subscribe');

  //     (async () => {
  //       for await (const _ of graph.observe()) {
  //         console.log('XXXXXXXXXXX subscribing onStoreChange', _);
  //         onStoreChange();
  //       }

  //       console.log('!!!!!!!!!! DONE');
  //     })();

  //     return () => {
  //       // TODO: Need to find a way to unsubscribe, it seems iteration is not a good idea as we cannot unsubscribe immediately.
  //     };
  //   },
  //   [graph]
  // );

  // const nodeMap: ReadonlyMap<Identifier, SlantNode> = useSyncExternalStore(subscribe, getSnapshot);
  const [nodeMap, setNodeMap] = useState<ReadonlyMap<Identifier, SlantNode>>(() => Object.freeze(new Map()));
  const [orderedMessages, setOrderedMessages] = useState<readonly MessageNode[]>(Object.freeze([]));

  const orderedMessagesRef = useRefFrom(orderedMessages);

  useEffect(() => {
    const handleChange = (event: CustomEvent & { readonly detail: { readonly ids: readonly Identifier[] } }) => {
      // eslint-disable-next-line no-console
      console.log('🔔🔔🔔🔔🔔 graph updated via CHANGE', event);

      let nextOrderedMessages: MessageNode[] | undefined;

      for (const id of event.detail.ids) {
        const node = graph.get(id);

        if (node && isOfType(node, 'Message')) {
          const message = node as MessageNode;

          nextOrderedMessages ||= Array.from(orderedMessagesRef.current);
          nextOrderedMessages.push(message);
        }
      }

      if (nextOrderedMessages) {
        // TODO: [P0] Insertion sort is cheaper by 20x.
        nextOrderedMessages.sort((x, y) => x.position[0] - y.position[0]);
        setOrderedMessages(Object.freeze(nextOrderedMessages));
      }
    };

    graph.addEventListener('change', handleChange as any);

    return () => graph.removeEventListener('change', handleChange as any);
  }, [graph, orderedMessagesRef, setNodeMap, setOrderedMessages]);

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

  // useEffect(() => {
  //   (async () => {
  //     for await (const change of graph.observe()) {
  //       // eslint-disable-next-line no-console
  //       console.log('🔔🔔🔔🔔🔔 graph updated', change);

  //       let nextOrderedActivities: WebChatActivity[] | undefined;

  //       for (const id of change.ids) {
  //         const node = graph.get(id);

  //         if (node && isOfType(node, 'Message')) {
  //           const message = node as MessageNode;

  //           nextOrderedActivities ||= Array.from(orderedActivitiesRef.current);

  //           nextOrderedActivities.push(
  //             JSON.parse(message['urn:microsoft:webchat:direct-line-activity:raw-json'][0]) as WebChatActivity
  //           );

  //           nextOrderedActivities.sort(
  //             (x, y) => x.channelData['webchat:sequence-id'] - y.channelData['webchat:sequence-id']
  //           );
  //         }
  //       }

  //       nextOrderedActivities && setOrderedActivities(Object.freeze(nextOrderedActivities));
  //     }
  //   })();
  // }, [graph, orderedActivitiesRef, setNodeMap, setOrderedActivities]);

  // const activityJSONMap = useMemoWithPrevious<ReadonlyMap<string, WebChatActivity>>(
  //   prevActivityJSONMap => {
  //     const nextMap = new Map();

  //     for (const activityNode of nodeMap.values().filter((node): node is MessageNode => isOfType(node, 'Message'))) {
  //       const id = activityNode['@id'];

  //       nextMap.set(
  //         id,
  //         prevActivityJSONMap?.get(id) ||
  //           (JSON.parse(activityNode['urn:microsoft:webchat:direct-line-activity:raw-json'][0]) as WebChatActivity)
  //       );
  //     }

  //     return nextMap;
  //   },
  //   [nodeMap]
  // );

  // const orderedActivitiesState = useMemo<readonly [readonly WebChatActivity[]]>(() => {
  //   // eslint-disable-next-line no-console
  //   console.log('🔍🔍🔍🔍🔍 orderedActivities updated');

  //   performance.mark('orderedActivities:start');

  //   // TODO: [P*] Try insertion sort and mutation.
  //   const result: readonly [readonly WebChatActivity[]] = Object.freeze([
  //     Object.freeze(
  //       Array.from(nodeMap.values().filter((node): node is MessageNode => isOfType(node, 'Message')))
  //         // TODO: [P0] Insertion sort should be cheaper.
  //         .sort((x, y) => x.position[0] - y.position[0])
  //         .map(node => {
  //           const activityJSON = activityJSONMap.get(node['@id']);

  //           if (typeof activityJSON === 'undefined') {
  //             throw new Error(`ASSERTION: activityJSON not found for @id of "${node['@id']}"`);
  //           }

  //           return activityJSON;
  //         })
  //     )
  //   ]);

  //   performance.mark('orderedActivities:end');
  //   performance.measure('orderedActivities:duration', 'orderedActivities:start', 'orderedActivities:end');

  //   return result;
  // }, [activityJSONMap, nodeMap]);

  // const orderedActivities = useMemoWithPrevious<readonly WebChatActivity[]>(
  //   prevOrderedActivities => {
  //     // eslint-disable-next-line no-console
  //     console.log('🔍🔍🔍🔍🔍 orderedActivities updated');

  //     performance.mark('orderedActivities:start');

  //     // TODO: [P*] Try insertion sort and mutation.
  //     const result: readonly [readonly WebChatActivity[]] = Object.freeze([
  //       Object.freeze(
  //         Array.from(nodeMap.values().filter((node): node is MessageNode => isOfType(node, 'Message')))
  //           // TODO: [P0] Insertion sort should be cheaper.
  //           .sort((x, y) => x.position[0] - y.position[0])
  //           .map(node => {
  //             const activityJSON = activityJSONMap.get(node['@id']);

  //             if (typeof activityJSON === 'undefined') {
  //               throw new Error(`ASSERTION: activityJSON not found for @id of "${node['@id']}"`);
  //             }

  //             return activityJSON;
  //           })
  //       )
  //     ]);

  //     performance.mark('orderedActivities:end');
  //     performance.measure('orderedActivities:duration', 'orderedActivities:start', 'orderedActivities:end');

  //     return result;
  //   },
  //   [activityJSONMap, nodeMap]
  // );

  // useEffect(() => {
  //   // eslint-disable-next-line no-console
  //   console.log('🔍🔍🔍🔍🔍 nodeMap', nodeMap);
  //   // eslint-disable-next-line no-console
  //   console.log('🔍🔍🔍🔍🔍 orderedActivities', orderedActivitiesState[0]);
  // }, [nodeMap, orderedActivitiesState]);

  // Build graph using `useSyncExternalStore()` so we can run graph everywhere.
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
