import { type GraphMiddleware } from '../../Graph';
import colorNode, { type SlantNode } from '../../schemas/colorNode';
import flattenNodeObject from '../../schemas/flattenNodeObject';
import type { Identifier } from '../../schemas/Identifier';
import type { AnyNode } from '../SlantGraph';

const color: GraphMiddleware<AnyNode, SlantNode> = () => next => upsertingNodeMap => {
  const nextUpsertingNodeMap = new Map<Identifier, SlantNode>();

  for (const node of upsertingNodeMap.values()) {
    for (const flattenedNode of flattenNodeObject(node).graph) {
      nextUpsertingNodeMap.set(flattenedNode['@id'], colorNode(flattenedNode));
    }
  }

  return next(nextUpsertingNodeMap);
};

export default color;
