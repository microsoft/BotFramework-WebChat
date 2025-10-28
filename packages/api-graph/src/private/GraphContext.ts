import { createContext, useContext } from 'react';
import { custom, function_, map, object, pipe, readonly, safeParse, string, type InferOutput } from 'valibot';

import { expandedFlatNodeObjectSchema } from './schemas/expandArray';
import type { FlattenNodeObjectInput } from './schemas/flattenNodeObject';

const graphContextSchema = pipe(
  object({
    graph: pipe(map(string(), expandedFlatNodeObjectSchema), readonly()),
    mergeNode: custom<(node: FlattenNodeObjectInput) => void>(value => safeParse(function_(), value).success)
  }),
  readonly()
);

type GraphContextType = InferOutput<typeof graphContextSchema>;

const GraphContext = createContext<GraphContextType>(
  new Proxy({} as GraphContextType, {
    get() {
      throw new Error('This hook can only be used under <GraphProvider>');
    }
  })
);

function useGraphContext(): GraphContextType {
  return useContext(GraphContext);
}

export default GraphContext;
export { graphContextSchema, useGraphContext, type GraphContextType };
