import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { useMemo, useState } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import GraphContext from './GraphContext';
import type { NodeObject } from './schemas/NodeObject';

const graphProviderPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type GraphProviderProps = InferInput<typeof graphProviderPropsSchema>;

function GraphProvider(props: GraphProviderProps) {
  const { children } = validateProps(graphProviderPropsSchema, props);

  const [graph, setGraph] = useState<ReadonlyMap<string, NodeObject>>(() => Object.freeze(new Map()));

  const context = useMemo(() => Object.freeze({ graph }), [graph]);

  return <GraphContext.Provider value={context}>{children}</GraphContext.Provider>;
}

GraphProvider.displayName = 'GraphProvider';

export default GraphProvider;
export { graphProviderPropsSchema, type GraphProviderProps };
