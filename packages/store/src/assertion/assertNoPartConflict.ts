import type { NodeIdentifier } from '../node/NodeIdentifier.ts';

/**
 * RULE: A node must not drop a pending part declared by another node in the same transaction.
 *
 * Links made by the other side before the node is in the graph are pending, the updater was shown `undefined` and did
 * not see them. If `hasPart`/`isPartOf` returned from the updater does not include a pending link (including omitting
 * the property), it is a conflict between 2 writers in the same transaction.
 *
 * @param id ID of the node being upserted.
 * @param childIds IDs of children in `hasPart` of the node.
 * @param parentIds IDs of parents in `isPartOf` of the node.
 * @param pendingChildIds IDs of children which declared the node in their `isPartOf`, but not shown to the updater.
 * @param pendingParentIds IDs of parents which declared the node in their `hasPart`, but not shown to the updater.
 */
function assertNoPartConflict(
  id: NodeIdentifier,
  childIds: ReadonlySet<NodeIdentifier>,
  parentIds: ReadonlySet<NodeIdentifier>,
  pendingChildIds: ReadonlySet<NodeIdentifier>,
  pendingParentIds: ReadonlySet<NodeIdentifier>
): void {
  const droppedChildId = Array.from(pendingChildIds).find(childId => !childIds.has(childId));
  const droppedParentId = Array.from(pendingParentIds).find(parentId => !parentIds.has(parentId));

  if (droppedChildId) {
    throw new Error(
      `Node "${id}" must have part "${droppedChildId}" in hasPart, as "${droppedChildId}" is part of it in the same transaction`
    );
  }

  if (droppedParentId) {
    throw new Error(
      `Node "${id}" must be part of "${droppedParentId}" in isPartOf, as "${droppedParentId}" has part of it in the same transaction`
    );
  }
}

export default assertNoPartConflict;
