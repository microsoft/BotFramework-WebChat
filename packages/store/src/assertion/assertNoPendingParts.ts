import type { Identifier } from '../node/NodeIdentifier.ts';

/**
 * RULE: All nodes in `hasPart` must be in the graph.
 *
 * A parent could be upserted before its children in the same transaction, the parent is pending until the children are
 * upserted, thus, it is verified on commit.
 *
 * @param pendingParentIds Map of child IDs to IDs of parents which have the child in `hasPart`, but the child is not
 *                         in the graph.
 */
function assertNoPendingParts(pendingParentIds: ReadonlyMap<Identifier, ReadonlySet<Identifier>>): void {
  for (const [childId, parentIds] of pendingParentIds) {
    const [parentId] = parentIds;

    if (parentId) {
      throw new Error(`Node "${parentId}" has part "${childId}" which is not in the graph`);
    }
  }
}

export default assertNoPendingParts;
