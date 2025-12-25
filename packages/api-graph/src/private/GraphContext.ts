import { freeze } from '@msinternal/botframework-webchat-base/valibot';
import type { DirectLineActivityNode, Identifier, SlantNode } from '@msinternal/botframework-webchat-core-graph';
import type { WebChatActivity } from 'botframework-webchat-core';
import { IdentifierSchema, SlantNodeSchema } from 'botframework-webchat-core/graph';
import { createContext, useContext } from 'react';
import { array, custom, map, object, pipe, tuple } from 'valibot';

const graphContextSchema = pipe(
  object({
    orderedActivitiesState: pipe(tuple([pipe(array(custom<WebChatActivity>(() => true)), freeze())]), freeze()),
    orderedMessageNodesState: pipe(
      tuple([pipe(array(custom<DirectLineActivityNode>(() => true)), freeze())]),
      freeze()
    ),
    readonlyGraphState: pipe(tuple([pipe(map(IdentifierSchema, SlantNodeSchema), freeze())]), freeze())
  }),
  freeze()
);

// Because SlantNode need some special treatment around objectWithRest(), InferOutput<T> is not working here.
// type GraphContextType = InferOutput<typeof graphContextSchema>;

type GraphContextType = {
  readonly orderedActivitiesState: readonly [readonly WebChatActivity[]];
  readonly orderedMessageNodesState: readonly [readonly DirectLineActivityNode[]];
  readonly readonlyGraphState: readonly [ReadonlyMap<Identifier, SlantNode>];
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
