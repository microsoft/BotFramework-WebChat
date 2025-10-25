import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { useMemo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import GraphContext from './GraphContext';

const graphProviderPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type GraphProviderProps = InferInput<typeof graphProviderPropsSchema>;

function GraphProvider(props: GraphProviderProps) {
  const { children } = validateProps(graphProviderPropsSchema, props);

  const context = useMemo(() => Object.freeze({ objects: Object.freeze(new Map()) }), []);

  return <GraphContext.Provider value={context}>{children}</GraphContext.Provider>;
}

GraphProvider.displayName = 'GraphProvider';

export default GraphProvider;
export { graphProviderPropsSchema, type GraphProviderProps };
