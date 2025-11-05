import { assert } from 'valibot';
import Graph, { type GraphMiddleware } from './Graph2';
import colorNode, { SlantNodeSchema, type SlantNode } from './schemas/colorNode';
import flattenNodeObject from './schemas/flattenNodeObject';
import type { Identifier } from './schemas/Identifier';
import isOfType from './schemas/isOfType';
import { MessageNodeSchema } from './schemas/MessageNode';

type AnyNode = Record<string, unknown> & {
  readonly '@id': Identifier;
  readonly '@type': string | readonly string[];
};

const VALIDATION_SCHEMAS_BY_TYPE = new Map([['Message', MessageNodeSchema]]);

const color: GraphMiddleware<AnyNode, SlantNode> = () => () => upsertingNodeMap => {
  const nextUpsertingNodeMap = new Map<Identifier, SlantNode>();

  for (const node of upsertingNodeMap.values()) {
    for (const flattenedNode of flattenNodeObject(node).graph) {
      nextUpsertingNodeMap.set(flattenedNode['@id'], colorNode(flattenedNode));
    }
  }

  return nextUpsertingNodeMap;
};

const validateSlantNode: GraphMiddleware<AnyNode, SlantNode> = () => () => upsertingNodeMap => {
  for (const node of upsertingNodeMap.values()) {
    assert(SlantNodeSchema, node);

    for (const [type, schema] of VALIDATION_SCHEMAS_BY_TYPE) {
      isOfType(node, type) && assert(schema, node);
    }
  }

  return upsertingNodeMap as ReadonlyMap<Identifier, SlantNode>;
};

class SlantGraph extends Graph<AnyNode, SlantNode> {
  constructor() {
    super(color, validateSlantNode);
  }
}

export default SlantGraph;

export { type AnyNode as InputNode };
