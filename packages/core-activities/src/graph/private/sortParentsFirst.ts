import type { GetNode, GraphIdentifier, GraphNode } from '../types';
import { getParentId } from './nodeProperties';

// The tree has 4 levels (conversation, HowTo, livestream session, message), the limit only guards against a cycle.
const MAX_DEPTH = 16;

/**
 * Sorts nodes so that every parent (by `isPartOf`) comes before its parts.
 *
 * The store reads `hasPart` in an upsert as "these are my parts". Upserting parents first means a new parent has no
 * parts yet when it is upserted, and no upsert lists a part that is not in the graph yet.
 *
 * QUESTION(William): the order also avoids a store bug: when a node is upserted after a parent listed it in `hasPart`
 * in the same transaction, the store drops the node's own `hasPart` before reading it, so its parts lose their
 * `isPartOf`.
 *
 * @param getNode Reads the nodes as they will be after the transaction, to find each node's parent.
 */
export default function sortParentsFirst(nodes: Iterable<GraphNode>, getNode: GetNode): readonly GraphNode[] {
  const depths = new Map<GraphIdentifier, number>();

  const getDepth = (id: GraphIdentifier, level: number): number => {
    let depth = depths.get(id);

    if (typeof depth === 'undefined') {
      const parentId = getParentId(getNode(id));

      depth = parentId && level < MAX_DEPTH ? getDepth(parentId, level + 1) + 1 : 0;
      depths.set(id, depth);
    }

    return depth;
  };

  return Array.from(nodes).sort((x, y) => getDepth(x['@id'], 0) - getDepth(y['@id'], 0));
}
