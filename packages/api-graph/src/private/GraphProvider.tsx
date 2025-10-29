import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { useCallback, useMemo, useState } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import GraphContext from './GraphContext';
import type { ExpandedFlatNodeObject } from './schemas/expandArray';
import expandArray from './schemas/expandArray';
import flattenNodeObject, { type FlattenNodeObjectInput } from './schemas/flattenNodeObject';

const graphProviderPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type GraphProviderProps = InferInput<typeof graphProviderPropsSchema>;

function GraphProvider(props: GraphProviderProps) {
  const { children } = validateProps(graphProviderPropsSchema, props);

  const [graph, setGraph] = useState<ReadonlyMap<string, ExpandedFlatNodeObject>>(() => Object.freeze(new Map()));

  const mergeGraph = useCallback(
    (graph: ExpandedFlatNodeObject[]) => {
      setGraph(existingGraph => {
        const nextGraph = new Map(existingGraph);

        for (const node of graph) {
          nextGraph.set(node['@id'], node);
        }

        return nextGraph;
      });
    },
    [setGraph]
  );

  const mergeNode = useCallback(
    (node: FlattenNodeObjectInput) => {
      const { graph } = flattenNodeObject(node);
      const expandedGraph = graph.map(expandArray);

      mergeGraph(expandedGraph);
    },
    [mergeGraph]
  );

  // Build graph using `useSyncExternalStore()` so we can run graph everywhere.
  const context = useMemo(() => Object.freeze({ graph, mergeNode }), [graph, mergeNode]);

  return <GraphContext.Provider value={context}>{children}</GraphContext.Provider>;
}

GraphProvider.displayName = 'GraphProvider';

export default GraphProvider;
export { graphProviderPropsSchema, type GraphProviderProps };
