import type { Identifier } from '../node/NodeIdentifier.ts';
import { getNodeSetIds } from '../structure/FrozenNodeSet.ts';
import FrozenSet from '../structure/FrozenSet.ts';
import type { DraftNode } from './DraftNode.ts';
import type { FrozenInternalNode } from './FrozenInternalNode.ts';

type PartProperty = 'hasPart' | 'isPartOf';

const EMPTY_PART_IDS: ReadonlySet<Identifier> = new FrozenSet<Identifier>([]);

/**
 * Gets IDs of nodes in the `hasPart` or `isPartOf` property in O(1) without copying.
 *
 * Only accepts nodes created by `createNode()` or committed by `commitDraft()`, which always store the property as
 * `FrozenNodeSet`. Throws if the property is not a `FrozenNodeSet`, i.e. the node did not go through `createNode()`.
 */
function getPartIds(node: DraftNode | FrozenInternalNode | undefined, property: PartProperty): ReadonlySet<Identifier> {
  const references = property === 'hasPart' ? node?.hasPart : node?.isPartOf;

  if (!references?.size) {
    return EMPTY_PART_IDS;
  }

  const ids = getNodeSetIds(references);

  if (!ids) {
    throw new Error(`ASSERTION: ${property} of node "${node?.['@id']}" must be a FrozenNodeSet`);
  }

  return ids;
}

export default getPartIds;
export type { PartProperty };
