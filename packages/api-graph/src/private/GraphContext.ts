import { createContext, useContext } from 'react';
import { map, object, pipe, readonly, string, type InferOutput } from 'valibot';

import { nodeObject } from './schemas/NodeObject';

const graphContextSchema = pipe(
  object({
    graph: pipe(map(string(), nodeObject()), readonly())
  }),
  readonly()
);

type GraphContextType = InferOutput<typeof graphContextSchema>;

const GraphContext = createContext<GraphContextType>({
  graph: Object.freeze(new Map())
});

function useGraphContext(): GraphContextType {
  return useContext(GraphContext);
}

export default GraphContext;
export { graphContextSchema, useGraphContext, type GraphContextType };
