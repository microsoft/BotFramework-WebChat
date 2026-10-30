import type { GetNode, GraphIdentifier, GraphNode } from '../types';

/**
 * Returns the parts of a node (`hasPart`), sorted by their `position`.
 */
export default function getOrderedParts(getNode: GetNode, parentId: GraphIdentifier): readonly GraphNode[] {
  const parts: GraphNode[] = [];

  for (const { '@id': partId } of getNode(parentId)?.hasPart ?? []) {
    const part = getNode(partId);

    part && parts.push(part);
  }

  // `Array.prototype.sort` is stable: parts without a position keep their `hasPart` order.
  return Object.freeze(parts.sort(({ position: x = 0 }, { position: y = 0 }) => x - y));
}
