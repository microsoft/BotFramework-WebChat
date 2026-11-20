import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import type { NodeReference } from '../node/NodeReference.ts';
import { getNodeSetIds } from '../structure/FrozenNodeSet.ts';
import FrozenSet from '../structure/FrozenSet.ts';

type PartProperty = 'hasPart' | 'isPartOf';

const EMPTY_PART_IDS: ReadonlySet<Identifier> = new FrozenSet<Identifier>([]);

// IDs built from node references which are not `FrozenNodeSet`, keyed by the references. As `Node` is read-only, the
// references are treated as immutable. A `WeakMap` is used because the references could be frozen.
const builtPartIdsCache = new WeakMap<ReadonlySet<NodeReference>, ReadonlySet<Identifier>>();

function buildPartIds(references: ReadonlySet<NodeReference>): ReadonlySet<Identifier> {
  let ids = builtPartIdsCache.get(references);

  if (!ids) {
    ids = new FrozenSet(Array.from(references, ({ '@id': id }) => id));

    builtPartIdsCache.set(references, ids);
  }

  return ids;
}

/**
 * Gets IDs of nodes in the `hasPart` or `isPartOf` property.
 *
 * Returns the IDs in O(1) without copying if the property is a `FrozenNodeSet` (i.e. the node is created by
 * `createNode()`), otherwise, builds them in O(k) on first call and caches them for subsequent calls.
 */
function getPartIds(node: Pick<Node, PartProperty> | undefined, property: PartProperty): ReadonlySet<Identifier> {
  const references = property === 'hasPart' ? node?.hasPart : node?.isPartOf;

  return references?.size ? (getNodeSetIds(references) ?? buildPartIds(references)) : EMPTY_PART_IDS;
}

export default getPartIds;
export type { PartProperty };
