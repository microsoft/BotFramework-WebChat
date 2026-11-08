import type { Identifier } from '../node/NodeIdentifier.ts';
import type { NodeReference } from '../node/NodeReference.ts';
import FrozenNodeSet from '../structure/FrozenNodeSet.ts';
import type FrozenSkipList from '../structure/FrozenSkipList.ts';
import type { InternalNode } from './InternalNode.ts';
import { sortedChildIdsSymbol } from './sortedChildIds.ts';
import type { UnfrozenNode } from './UnfrozenNode.ts';

/**
 * Sets `hasPart` and sorted children on an unfrozen node, then freezes the node in place for storing in the graph.
 *
 * This is O(1), the node is not copied. After this call, the node is frozen and must not be modified.
 *
 * All nodes stored in the graph must be frozen by this function, the returned node is branded as `InternalNode`.
 *
 * @param childIds IDs of children, `hasPart` is generated from it. `hasPart` of the node is ignored.
 * @param sortedChildIds IDs of children sorted by `dateCreated`, see `getSortedChildIds()`.
 */
function freezeNode(
  node: UnfrozenNode,
  childIds: ReadonlySet<Identifier>,
  sortedChildIds: FrozenSkipList<Identifier> | undefined
): InternalNode {
  const writableNode: { hasPart?: ReadonlySet<NodeReference> | undefined } = node;

  if (childIds.size) {
    writableNode.hasPart = new FrozenNodeSet(childIds);
  } else {
    delete writableNode.hasPart;
  }

  return Object.freeze<object>(
    Object.defineProperty(node, sortedChildIdsSymbol, { value: sortedChildIds })
  ) satisfies object as InternalNode;
}

export default freezeNode;
