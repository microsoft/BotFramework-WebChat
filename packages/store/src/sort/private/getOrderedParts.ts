import type { Node } from '../../node/Node.ts';
import type { Identifier } from '../../node/NodeIdentifier.ts';

/**
 * Returns the parts of a node (`hasPart`), sorted by their `position`.
 */
export default function getOrderedParts(
  getNode: (id: Identifier) => Node | undefined,
  parentId: Identifier
): readonly Node[] {
  const parts: Node[] = [];

  for (const { '@id': partId } of getNode(parentId)?.hasPart ?? []) {
    const part = getNode(partId);

    part && parts.push(part);
  }

  // `Array.prototype.sort` is stable: parts without a position keep their `hasPart` order.
  return Object.freeze(parts.sort(({ position: x = 0 }, { position: y = 0 }) => x - y));
}
