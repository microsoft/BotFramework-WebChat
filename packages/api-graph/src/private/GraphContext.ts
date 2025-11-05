import type { WebChatActivity } from 'botframework-webchat-core';
import { IdentifierSchema, SlantNodeSchema, type Identifier, type SlantNode } from 'botframework-webchat-core/graph';
import { createContext, useContext } from 'react';
import { array, custom, map, object, pipe, readonly, tuple } from 'valibot';

const graphContextSchema = pipe(
  object({
    // TODO: Maybe should use `freeze()` instead.
    nodeMap: pipe(map(IdentifierSchema, SlantNodeSchema), readonly()),
    // TODO: Maybe should use `freeze()` instead.
    orderedActivitiesState: pipe(tuple([pipe(array(custom<WebChatActivity>(() => true)), readonly())]), readonly())
  }),
  readonly()
);

// Because SlantNode need some special treatment around objectWithRest(), InferOutput<T> is not working here.
// type GraphContextType = InferOutput<typeof graphContextSchema>;

type GraphContextType = {
  readonly nodeMap: ReadonlyMap<Identifier, SlantNode>;
  readonly orderedActivitiesState: readonly [readonly WebChatActivity[]];
};

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
