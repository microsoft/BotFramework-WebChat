import type { Identifier } from '../node/NodeIdentifier.ts';
import FrozenNodeSet from '../structure/FrozenNodeSet.ts';
import { attachDateCreatedTime, getDateCreatedTime } from './dateCreatedTime.ts';
import type { InternalNode } from './InternalNode.ts';
import { sortedChildIdsSymbol } from './sortedChildIds.ts';
import type FrozenSkipList from '../structure/FrozenSkipList.ts';

/**
 * Returns a copy of the node with `hasPart` generated from the IDs of its children, and IDs of its children sorted by
 * `dateCreated` for `Store.getSortedParts()`.
 *
 * - `hasPart` is a `FrozenNodeSet` wrapping `childIds`, it is not copied if `childIds` is a read-only `Set`
 * - If `childIds` is empty, the node will not have `hasPart`
 *
 * The node must be created by `createNode()` or this function. Other properties, and the cached `dateCreated`, are copied
 * as-is without validation.
 * This is O(number of properties), regardless of the number of children.
 */
function attachHasPart(
  node: InternalNode,
  childIds: ReadonlySet<Identifier>,
  sortedChildIds: FrozenSkipList<Identifier> | undefined
): InternalNode {
  const { hasPart: _, ...nextNode } = node;

  return Object.freeze(
    attachDateCreatedTime(
      Object.defineProperty(
        childIds.size ? { ...nextNode, hasPart: new FrozenNodeSet(childIds) } : nextNode,
        sortedChildIdsSymbol,
        { value: sortedChildIds }
      ),
      getDateCreatedTime(node)
    )
  );
}

export default attachHasPart;
