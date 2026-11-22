import type { NodeIdentifier } from '../node/NodeIdentifier.ts';

type Options = {
  /** IDs of children in `hasPart` returned from the updater. */
  readonly childIds: ReadonlySet<NodeIdentifier>;
  /** ID of the node being upserted. */
  readonly id: NodeIdentifier;
  /** IDs of parents in `isPartOf` returned from the updater. */
  readonly parentIds: ReadonlySet<NodeIdentifier>;
  /** IDs of children which made the link in this transaction, they are confirmed by the node. */
  readonly pendingChildIds: ReadonlySet<NodeIdentifier>;
  /** IDs of parents which made the link in this transaction, they are confirmed by the node. */
  readonly pendingParentIds: ReadonlySet<NodeIdentifier>;
  /** IDs of parents in `isPartOf` before the upsert. */
  readonly prevParentIds: ReadonlySet<NodeIdentifier>;
  /** IDs of children in `hasPart` shown to the updater. */
  readonly shownChildIds: ReadonlySet<NodeIdentifier>;
  /** IDs of nodes upserted in this transaction. */
  readonly upsertedIds: ReadonlySet<NodeIdentifier>;
};

function findChange(
  nextIds: ReadonlySet<NodeIdentifier>,
  prevIds: ReadonlySet<NodeIdentifier>,
  confirmedIds: ReadonlySet<NodeIdentifier>,
  upsertedIds: ReadonlySet<NodeIdentifier>
): readonly [NodeIdentifier, boolean] | undefined {
  const addedId = Array.from(nextIds).find(id => upsertedIds.has(id) && !prevIds.has(id) && !confirmedIds.has(id));
  const removedId = Array.from(prevIds).find(id => upsertedIds.has(id) && !nextIds.has(id));

  return addedId ? [addedId, true] : removedId ? [removedId, false] : undefined;
}

/**
 * RULE: A node must not change a part relationship of the other side which is upserted in the same transaction.
 *
 * Both sides upserted in the same transaction declared their own `hasPart`/`isPartOf`, if they disagree, it is a conflict
 * between 2 writers in the same transaction. If the other side is not upserted in the transaction, it is auto-fixed.
 */
function assertNoPartChangeToUpserted({
  childIds,
  id,
  parentIds,
  pendingChildIds,
  pendingParentIds,
  prevParentIds,
  shownChildIds,
  upsertedIds
}: Options): void {
  const childChange = findChange(childIds, shownChildIds, pendingChildIds, upsertedIds);
  const parentChange = findChange(parentIds, prevParentIds, pendingParentIds, upsertedIds);

  if (childChange) {
    const [childId, included] = childChange;

    throw new Error(
      included
        ? `Node "${childId}" must be part of "${id}" in isPartOf, as "${id}" has part of it in the same transaction`
        : `Node "${childId}" must not be part of "${id}" in isPartOf, as "${id}" does not have part of it in the same transaction`
    );
  }

  if (parentChange) {
    const [parentId, included] = parentChange;

    throw new Error(
      included
        ? `Node "${parentId}" must have part "${id}" in hasPart, as "${id}" is part of it in the same transaction`
        : `Node "${parentId}" must not have part "${id}" in hasPart, as "${id}" is not part of it in the same transaction`
    );
  }
}

export default assertNoPartChangeToUpserted;
