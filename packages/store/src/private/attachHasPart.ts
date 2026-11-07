import type { Identifier } from '../node/NodeIdentifier.ts';
import ReadonlyNodeSet from '../structure/ReadonlyNodeSet.ts';
import { attachDateCreatedTime, getDateCreatedTime } from './dateCreatedTime.ts';
import type { InternalNode } from './InternalNode.ts';
import { sortedChildIdsSymbol } from './sortedChildIds.ts';
import type ReadonlySkipList from '../structure/ReadonlySkipList.ts';

/**
 * Returns a copy of the node with `hasPart` generated from the IDs of its children, and IDs of its children sorted by
 * `dateCreated` for `Store.getSortedParts()`.
 *
 * - `hasPart` is a `ReadonlyNodeSet` wrapping `childIds`, it is not copied if `childIds` is a read-only `Set`
 * - If `childIds` is empty, the node will not have `hasPart`
 *
 * The node must be created by `createNode()` or this function. Other properties, and the cached `dateCreated`, are copied
 * as-is without validation.
 * This is O(number of properties), regardless of the number of children.
 */
function attachHasPart(
  node: InternalNode,
  childIds: ReadonlySet<Identifier>,
  sortedChildIds: ReadonlySkipList<Identifier> | undefined
): InternalNode {
  const { hasPart: _, ...nextNode } = node;

  return Object.freeze(
    attachDateCreatedTime(
      Object.defineProperty(
        childIds.size ? { ...nextNode, hasPart: new ReadonlyNodeSet(childIds) } : nextNode,
        sortedChildIdsSymbol,
        { value: sortedChildIds }
      ),
      getDateCreatedTime(node)
    )
  );
}

export default attachHasPart;
