import type { Identifier } from '../node/NodeIdentifier.ts';
import { getNodeSetIds } from '../structure/FrozenNodeSet.ts';
import FrozenSet from '../structure/FrozenSet.ts';
import type { DraftNode } from './DraftNode.ts';
import type { FrozenNode } from './FrozenNode.ts';

type PartNode = DraftNode | FrozenNode;

const EMPTY_PART_IDS: ReadonlySet<Identifier> = new FrozenSet<Identifier>([]);

function getPartIds(
  node: PartNode | undefined,
  references: PartNode['hasPart'] | PartNode['isPartOf'],
  property: 'hasPart' | 'isPartOf'
): ReadonlySet<Identifier> {
  if (!references?.size) {
    return EMPTY_PART_IDS;
  }

  const ids = getNodeSetIds(references);

  if (!ids) {
    throw new Error(`ASSERTION: ${property} of node "${node?.['@id']}" must be a FrozenNodeSet`);
  }

  return ids;
}

/**
 * Gets IDs of nodes in the `hasPart` property in O(1) without copying.
 *
 * Only accepts nodes created by `createDraftNode()` or committed by `Draft.commit()`, which always store the property as
 * `FrozenNodeSet`. Throws if the property is not a `FrozenNodeSet`, i.e. the node did not go through `createDraftNode()`.
 */
function getHasPartIds(node: PartNode | undefined): ReadonlySet<Identifier> {
  return getPartIds(node, node?.hasPart, 'hasPart');
}

/**
 * Gets IDs of nodes in the `isPartOf` property in O(1) without copying.
 *
 * Only accepts nodes created by `createDraftNode()` or committed by `Draft.commit()`, which always store the property as
 * `FrozenNodeSet`. Throws if the property is not a `FrozenNodeSet`, i.e. the node did not go through `createDraftNode()`.
 */
function getIsPartOfIds(node: PartNode | undefined): ReadonlySet<Identifier> {
  return getPartIds(node, node?.isPartOf, 'isPartOf');
}

export { getHasPartIds, getIsPartOfIds };
