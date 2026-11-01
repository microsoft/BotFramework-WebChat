import { parse } from 'valibot';
import { nodeSchema, type Node } from '../node/Node.ts';
import deepFreeze from './deepFreeze.ts';
import { attachPartIdsCache } from './getPartIds.ts';

/**
 * Validates the value and creates an immutable node for storing in the graph.
 *
 * - The node is validated against the node schema
 * - The node is deeply frozen
 * - IDs of nodes in `hasPart` and `isPartOf` are lazily cached in a hidden property by `getPartIds()`
 *
 * All nodes stored in the graph must be created by this function.
 */
function createNode(value: unknown): Node {
  return attachPartIdsCache(deepFreeze(parse(nodeSchema, value)));
}

export default createNode;
