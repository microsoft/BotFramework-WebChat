import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import { getNodeSetIds } from '../structure/FrozenNodeSet.ts';
import FrozenSet from '../structure/FrozenSet.ts';

type PartProperty = 'hasPart' | 'isPartOf';

const EMPTY_PART_IDS: ReadonlySet<Identifier> = new FrozenSet<Identifier>([]);

/**
 * Gets IDs of nodes in the `hasPart` or `isPartOf` property.
 *
 * Returns the IDs in O(1) without copying if the property is a `FrozenNodeSet` (i.e. the node is created by
 * `createNode()`), otherwise, builds them in O(k).
 */
function getPartIds(node: Pick<Node, PartProperty> | undefined, property: PartProperty): ReadonlySet<Identifier> {
  const references = property === 'hasPart' ? node?.hasPart : node?.isPartOf;

  return references?.size
    ? (getNodeSetIds(references) ?? new FrozenSet(Array.from(references, ({ '@id': id }) => id)))
    : EMPTY_PART_IDS;
}

export default getPartIds;
export type { PartProperty };
