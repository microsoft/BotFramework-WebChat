import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import createReadonlyNodeSet from './createReadonlyNodeSet.ts';
import { sortedChildIdsSymbol } from './sortedChildIds.ts';
import type { VersionedReadonlySkipList } from './createReadonlySkipList.ts';

/**
 * Returns a copy of the node with `hasPart` generated from the IDs of its children, and IDs of its children sorted by
 * `dateCreated` for `Store.getSortedChildren()`.
 *
 * - `hasPart` is a `ReadonlyNodeSet` wrapping `childIds`, it is not copied if `childIds` is a read-only `Set`
 * - If `childIds` is empty, the node will not have `hasPart`
 *
 * The node must be created by `createNode()` or this function. Other properties are copied as-is without validation.
 * This is O(number of properties), regardless of the number of children.
 */
function attachHasPart(
  node: Node,
  childIds: ReadonlySet<Identifier>,
  sortedChildIds: VersionedReadonlySkipList<Identifier> | undefined
): Node {
  const { hasPart: _, ...nextNode } = node;

  return Object.freeze(
    Object.defineProperty(
      childIds.size ? { ...nextNode, hasPart: createReadonlyNodeSet(childIds) } : nextNode,
      sortedChildIdsSymbol,
      { value: sortedChildIds }
    )
  );
}

export default attachHasPart;
