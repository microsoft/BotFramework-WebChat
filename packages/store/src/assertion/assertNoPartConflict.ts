import type { NodeIdentifier } from '../node/NodeIdentifier.ts';
import type { DraftNode } from '../private/DraftNode.ts';

/**
 * RULE: A node must not drop a pending part declared by another node in the same transaction.
 *
 * Links made by the other side before the node is in the graph are pending, the updater was shown `undefined` and did
 * not see them. If `hasPart`/`isPartOf` is omitted, pending links are kept. If it is declared without a pending link,
 * it is a conflict between 2 writers in the same transaction.
 *
 * @param node The node returned from the updater.
 * @param childIds IDs of children in `hasPart` of the node.
 * @param parentIds IDs of parents in `isPartOf` of the node.
 * @param pendingChildIds IDs of children which declared the node in their `isPartOf`, but not shown to the updater.
 * @param pendingParentIds IDs of parents which declared the node in their `hasPart`, but not shown to the updater.
 */
function assertNoPartConflict(
  node: DraftNode,
  childIds: ReadonlySet<NodeIdentifier>,
  parentIds: ReadonlySet<NodeIdentifier>,
  pendingChildIds: ReadonlySet<NodeIdentifier>,
  pendingParentIds: ReadonlySet<NodeIdentifier>
): void {
  const id = node['@id'];
  const droppedChildId = node.hasPart && Array.from(pendingChildIds).find(childId => !childIds.has(childId));
  const droppedParentId = node.isPartOf && Array.from(pendingParentIds).find(parentId => !parentIds.has(parentId));

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
