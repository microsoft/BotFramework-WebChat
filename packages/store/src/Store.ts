import { literal, object, optional, parse, picklist, pipe, readonly, type InferInput } from 'valibot';
import assertNoPendingParts from './assertion/assertNoPendingParts.ts';
import assertNotSelfPart from './assertion/assertNotSelfPart.ts';
import assertReferencedNodesInGraph from './assertion/assertReferencedNodesInGraph.ts';
import type { Node } from './node/Node.ts';
import { identifierSchema, type Identifier } from './node/NodeIdentifier.ts';
import FrozenMap, { type ReadWriteMap } from './structure/FrozenMap.ts';
import FrozenSet, { type ReadWriteSet } from './structure/FrozenSet.ts';
import createNode from './private/createNode.ts';
import type { InternalNode } from './private/InternalNode.ts';
import { getDateCreatedTime } from './private/dateCreatedTime.ts';
import FrozenSkipList, { type ReadWriteSkipList } from './structure/FrozenSkipList.ts';
import getPartIds from './private/getPartIds.ts';
import ReadWriteNode from './private/ReadWriteNode.ts';
import { getSortedChildIds, insertSortedChild, removeSortedChild } from './private/sortedChildIds.ts';

type StoreListener = (affectedNodeIds: ReadonlySet<Identifier>) => void;

interface StoreSource {
  start(controller: StoreController): void;
}

interface StoreController {
  /**
   * Edits the store in a transaction. All changes are committed at once after the transactor returns, or discarded if
   * the transactor throws.
   *
   * `edit()` cannot be called inside another `edit()`, i.e. inside the transactor or the updater. Listeners are called
   * after the edit has ended, they can call `edit()`.
   */
  edit(transactor: (transaction: StoreTransaction) => void): void;
}

interface StoreTransaction {
  /**
   * Deletes a node and removes all references pointing to the deleted node from other nodes.
   */
  delete(id: Identifier): void;

  /**
   * Inserts or updates a node. The updater will receive the current node (or `undefined` if not exists).
   * The node returned by the updater must have the same `@id` as the `id` argument.
   *
   * Part membership: `isPartOf` of the child is the source of truth, `hasPart` of the parent is generated from it.
   *
   * - When a child is upserted, its `isPartOf` is reflected in `hasPart` of its parents
   * - When a parent is upserted, its `hasPart` is not stored, instead, `isPartOf` of its children is updated immediately
   *   to mirror `hasPart`: children added to `hasPart` will have the parent added to their `isPartOf`, and vice versa
   * - If a child in `hasPart` is not in the graph yet, it must be upserted later in the same transaction, the parent
   *   will be added to its `isPartOf` when it is upserted
   */
  upsert(id: Identifier, updater: (node: Node | undefined) => Node): void;
}

const EMPTY_IDS: ReadonlySet<Identifier> = new FrozenSet<Identifier>([]);

const getSortedPartsInitSchema = pipe(
  object({
    // Only `dateCreated` is supported for now.
    by: literal('dateCreated', '"by" must be "dateCreated"'),
    order: optional(picklist(['asc', 'desc'], '"order" must be "asc", "desc", or undefined'))
  }),
  readonly()
);

type GetSortedPartsInit = InferInput<typeof getSortedPartsInitSchema>;

type ReferenceIds = FrozenMap<Identifier, FrozenSet<Identifier>>;

/**
 * Backward reference IDs (or child IDs) being modified in a transaction.
 *
 * A node could be referenced by many nodes (e.g. a conversation referenced by all messages). Instead of copying, sets
 * being modified are mutated via an overlay and kept in `sets` until commit.
 */
type MutableBackwardReferenceIds = {
  readonly map: ReadWriteMap<Identifier, FrozenSet<Identifier>>;
  readonly sets: Map<Identifier, ReadWriteSet<Identifier>>;
};

function getReferencingIds(backwardReferenceIds: MutableBackwardReferenceIds, id: Identifier): ReadonlySet<Identifier> {
  return backwardReferenceIds.sets.get(id) ?? backwardReferenceIds.map.get(id) ?? EMPTY_IDS;
}

function mutateReferencingIds(
  backwardReferenceIds: MutableBackwardReferenceIds,
  id: Identifier
): ReadWriteSet<Identifier> {
  let referencingIds = backwardReferenceIds.sets.get(id);

  // A new empty set is created every time, mutating a shared empty set would make other mutations of it O(size).
  referencingIds ||
    backwardReferenceIds.sets.set(
      id,
      (referencingIds = (backwardReferenceIds.map.get(id) ?? new FrozenSet<Identifier>([])).mutate())
    );

  return referencingIds;
}

function commitBackwardReferenceIds(backwardReferenceIds: MutableBackwardReferenceIds): ReferenceIds {
  for (const [id, referencingIds] of backwardReferenceIds.sets) {
    const nextReferencingIds = referencingIds.commit();

    nextReferencingIds.size
      ? backwardReferenceIds.map.set(id, nextReferencingIds)
      : backwardReferenceIds.map.delete(id);
  }

  return backwardReferenceIds.map.commit();
}

/**
 * Updates forward and backward reference maps with the new set of reference IDs of a node.
 */
function setReferenceIds(
  forwardReferenceIds: ReadWriteMap<Identifier, FrozenSet<Identifier>>,
  backwardReferenceIds: MutableBackwardReferenceIds,
  id: Identifier,
  nextReferenceIds: ReadonlySet<Identifier>
): void {
  const prevReferenceIds = forwardReferenceIds.get(id) ?? EMPTY_IDS;

  // Only touch backward references which are changed, a node could reference many nodes (e.g. `hasPart`).
  for (const referenceId of prevReferenceIds) {
    nextReferenceIds.has(referenceId) || mutateReferencingIds(backwardReferenceIds, referenceId).delete(id);
  }

  for (const referenceId of nextReferenceIds) {
    prevReferenceIds.has(referenceId) || mutateReferencingIds(backwardReferenceIds, referenceId).add(id);
  }

  nextReferenceIds.size ? forwardReferenceIds.set(id, new FrozenSet(nextReferenceIds)) : forwardReferenceIds.delete(id);
}

/**
 * Reads nodes being modified in a transaction, with drafts applied.
 */
type NextStateReader = {
  /** Gets `dateCreated` of the node as epoch time, `Infinity` if not set or the node does not exist. */
  getDateCreatedTime(id: Identifier): number;
  /** Gets IDs of parents in `isPartOf` of the node, empty if the node does not exist. */
  getPartOfIds(id: Identifier): ReadonlySet<Identifier>;
  has(id: Identifier): boolean;
};

/**
 * Updates sorted children of parents which children are added, removed, or changed `dateCreated`.
 *
 * Uses `mutate()` and `commit()`, the sorted children are not copied. Removal is expected O(1), insertion is O(1) when
 * appending to the end, otherwise, expected O(log n), see `insertSortedChild()` for details.
 *
 * @returns Key is the ID of the parent, value is the new sorted child IDs.
 */
function updateSortedChildIds(
  prevState: ReadonlyMap<string, InternalNode>,
  nextState: NextStateReader,
  affectedNodeIds: ReadonlySet<Identifier>
): Map<Identifier, FrozenSkipList<Identifier>> {
  const insertions: [Identifier, Identifier][] = [];
  const removals: [Identifier, Identifier][] = [];
  const sortedChildIds = new Map<Identifier, ReadWriteSkipList<Identifier>>();

  for (const id of affectedNodeIds) {
    const prevNode = prevState.get(id);
    const dateCreatedChanged = getDateCreatedTime(prevNode) !== nextState.getDateCreatedTime(id);
    const prevParentIds = getPartIds(prevNode, 'isPartOf');
    const parentIds = nextState.getPartOfIds(id);

    for (const parentId of prevParentIds) {
      (dateCreatedChanged || !parentIds.has(parentId)) && nextState.has(parentId) && removals.push([parentId, id]);
    }

    for (const parentId of parentIds) {
      (dateCreatedChanged || !prevParentIds.has(parentId)) && insertions.push([parentId, id]);
    }
  }

  // A new empty list is created for every parent, mutating a shared empty list would make other mutations of it O(size).
  const mutate = (parentId: Identifier): ReadWriteSkipList<Identifier> => {
    let mutableSortedChildIds = sortedChildIds.get(parentId);

    mutableSortedChildIds ||
      sortedChildIds.set(
        parentId,
        (mutableSortedChildIds = (
          getSortedChildIds(prevState.get(parentId)) ?? new FrozenSkipList<Identifier>()
        ).mutate())
      );

    return mutableSortedChildIds;
  };

  // Removes first, children remaining are either unchanged or new, so they can be compared using the next state.
  for (const [parentId, id] of removals) {
    removeSortedChild(mutate(parentId), id);
  }

  for (const [parentId, id] of insertions) {
    insertSortedChild(mutate(parentId), id, nextState.getDateCreatedTime(id), childId =>
      nextState.getDateCreatedTime(childId)
    );
  }

  return new Map(
    Array.from(sortedChildIds, ([parentId, mutableSortedChildIds]) => [parentId, mutableSortedChildIds.commit()])
  );
}

class Store {
  constructor(source: StoreSource) {
    let editing = false;

    const controller: StoreController = {
      edit: transactor => {
        if (typeof transactor !== 'function') {
          throw new TypeError('transactor must be a function');
        }

        if (editing) {
          throw new Error('edit() cannot be called inside another edit()');
        }

        editing = true;

        let affectedNodeIds: ReadonlySet<Identifier> | undefined;

        try {
          affectedNodeIds = this.#commit(transactor);
        } finally {
          editing = false;
        }

        // Listeners are called after the edit has ended, they can start a new edit.
        affectedNodeIds && this.#notifyAll(affectedNodeIds);
      }
    };

    source.start(controller);
  }

  /** Key is the node being referenced, values are IDs of nodes which reference the key node. */
  #backwardReferenceIds: ReferenceIds = new FrozenMap([]);
  /** Key is the parent node, values are IDs of children which have the parent in `isPartOf`. */
  #childIds: ReferenceIds = new FrozenMap([]);
  /** Key is the node containing node references, values are IDs of nodes being referenced by the key node. */
  #forwardReferenceIds: ReferenceIds = new FrozenMap([]);
  #listeners: Set<StoreListener> = new Set<StoreListener>();
  #state: FrozenMap<string, InternalNode> = new FrozenMap([]);

  /**
   * Runs the transactor and commits changes to the store.
   *
   * Multiple nodes can be added at once and they could cross reference each other. All nodes are added at once, part
   * relationships are mirrored, then the graph integrity is verified.
   *
   * @returns IDs of nodes which are added, updated, or deleted, or `undefined` if nothing is changed.
   */
  #commit(transactor: (transaction: StoreTransaction) => void): ReadonlySet<Identifier> | undefined {
    const affectedNodeIds = new Set<Identifier>();
    let ended = false;

    // Key is the ID of children in `hasPart` which are not in the graph yet, value is IDs of their parents.
    // When the child is upserted, the parents will be added to its `isPartOf`.
    const pendingParentIds = new Map<Identifier, Set<Identifier>>();

    // All edits are done on overlays without copying. If the transactor throws, overlays are discarded and the state
    // is not changed.
    const nextState = this.#state.mutate();
    const nextBackwardReferenceIds: MutableBackwardReferenceIds = Object.freeze({
      map: this.#backwardReferenceIds.mutate(),
      sets: new Map()
    });
    const nextChildIds: MutableBackwardReferenceIds = Object.freeze({
      map: this.#childIds.mutate(),
      sets: new Map()
    });
    const nextForwardReferenceIds = this.#forwardReferenceIds.mutate();

    const assertNotEnded = (): void => {
      if (ended) {
        throw new Error('Transaction has ended, it cannot be used after the transactor returns');
      }
    };

    // Nodes modified in this transaction. Changes are kept in drafts, and nodes are built once on commit.
    const drafts = new Map<Identifier, ReadWriteNode>();

    const nextStateReader: NextStateReader = Object.freeze({
      getDateCreatedTime: (id: Identifier): number =>
        drafts.get(id)?.dateCreatedTime ?? getDateCreatedTime(nextState.get(id)),
      getPartOfIds: (id: Identifier): ReadonlySet<Identifier> =>
        drafts.get(id)?.getPartOfIds() ?? getPartIds(nextState.get(id), 'isPartOf'),
      has: (id: Identifier): boolean => drafts.has(id) || nextState.has(id)
    });

    // Gets the draft of the node, or a new draft if the node is not modified in this transaction yet.
    // The new draft is not kept until `setDraft()` is called.
    const getDraft = (id: Identifier): ReadWriteNode | undefined => {
      const node = drafts.get(id) ?? nextState.get(id);

      return node instanceof ReadWriteNode || !node ? node : new ReadWriteNode(node);
    };

    // Gets the node with `hasPart` reflecting changes made in this transaction.
    const getNode = (id: Identifier): InternalNode | undefined => {
      const draft = drafts.get(id);
      const childIds = nextChildIds.sets.get(id);

      return draft || childIds
        ? getDraft(id)?.commit(new FrozenSet(getReferencingIds(nextChildIds, id)), undefined)
        : nextState.get(id);
    };

    const setPendingChild = (parentId: Identifier, childId: Identifier, included: boolean): void => {
      let parentIds = pendingParentIds.get(childId);

      parentIds || pendingParentIds.set(childId, (parentIds = new Set()));
      included ? parentIds.add(parentId) : parentIds.delete(parentId);
      mutateReferencingIds(nextChildIds, parentId)[included ? 'add' : 'delete'](childId);
    };

    // Keeps the draft and updates references. Callers must update `nextChildIds` if `isPartOf` is changed.
    const setDraft = (draft: ReadWriteNode): void => {
      const { id } = draft;

      drafts.set(id, draft);
      setReferenceIds(nextForwardReferenceIds, nextBackwardReferenceIds, id, draft.getReferenceIds());
      affectedNodeIds.add(id);
    };

    // Adds or removes a parent from `isPartOf` of the child, and mirrors it to children of the parent.
    const setPartOf = (child: ReadWriteNode, parentId: Identifier, included: boolean): void => {
      child.setPartOf(parentId, included) &&
        mutateReferencingIds(nextChildIds, parentId)[included ? 'add' : 'delete'](child.id);
      setDraft(child);
    };

    try {
      transactor(
        Object.freeze({
          delete: (id: Identifier): void => {
            assertNotEnded();

            const safeId = parse(identifierSchema, id);
            const existed = nextStateReader.has(safeId);

            for (const parentId of nextStateReader.getPartOfIds(safeId)) {
              mutateReferencingIds(nextChildIds, parentId).delete(safeId);
            }

            for (const parentId of pendingParentIds.get(safeId) ?? []) {
              mutateReferencingIds(nextChildIds, parentId).delete(safeId);
            }

            for (const [childId, parentIds] of pendingParentIds) {
              parentIds.delete(safeId) && mutateReferencingIds(nextChildIds, safeId).delete(childId);
            }

            pendingParentIds.delete(safeId);
            drafts.delete(safeId);
            nextState.delete(safeId);
            existed && affectedNodeIds.add(safeId);

            setReferenceIds(nextForwardReferenceIds, nextBackwardReferenceIds, safeId, EMPTY_IDS);

            // Children reference the deleted node via `isPartOf`, removing references will also remove them from
            // `hasPart` of the deleted node.
            // Copy before iterating as the set will be modified while removing references.
            for (const nodeId of Array.from(getReferencingIds(nextBackwardReferenceIds, safeId))) {
              const draft = getDraft(nodeId);

              if (draft) {
                const isChild = draft.getPartOfIds().has(safeId);

                if (draft.removeReferencesTo(safeId)) {
                  isChild && mutateReferencingIds(nextChildIds, safeId).delete(nodeId);
                  setDraft(draft);
                }
              }
            }
          },
          upsert: (id: Identifier, updater: (node: Node | undefined) => Node): void => {
            assertNotEnded();

            const safeId = parse(identifierSchema, id);

            if (typeof updater !== 'function') {
              throw new TypeError('updater must be a function');
            }

            const safeNode = createNode(updater(getNode(safeId)));

            if (safeNode['@id'] !== safeId) {
              throw new Error(`Node returned from updater must have @id of "${safeId}", cannot change @id`);
            }

            assertNotSelfPart(safeNode);

            // Read before the draft takes ownership of the node, `hasPart` is regenerated on commit.
            const childIds = getPartIds(safeNode, 'hasPart');
            const draft = new ReadWriteNode(safeNode);

            // The node is in `hasPart` of parents upserted before the node is in the graph, mirror them now.
            for (const parentId of pendingParentIds.get(safeId) ?? []) {
              draft.setPartOf(parentId, true);
            }

            pendingParentIds.delete(safeId);

            const parentIds = draft.getPartOfIds();
            const prevParentIds = nextStateReader.getPartOfIds(safeId);

            for (const parentId of prevParentIds) {
              parentIds.has(parentId) || mutateReferencingIds(nextChildIds, parentId).delete(safeId);
            }

            for (const parentId of parentIds) {
              prevParentIds.has(parentId) || mutateReferencingIds(nextChildIds, parentId).add(safeId);
            }

            // `hasPart` is not stored, it is mirrored to `isPartOf` of children below.
            setDraft(draft);

            // Copy before iterating as the set will be modified while mirroring.
            const prevChildIds = new Set(getReferencingIds(nextChildIds, safeId));

            for (const [childId, included] of [
              ...Array.from(prevChildIds)
                .filter(childId => !childIds.has(childId))
                .map(childId => [childId, false] as const),
              ...Array.from(childIds)
                .filter(childId => !prevChildIds.has(childId))
                .map(childId => [childId, true] as const)
            ]) {
              const child = getDraft(childId);

              child ? setPartOf(child, safeId, included) : setPendingChild(safeId, childId, included);
            }
          }
        })
      );
    } finally {
      ended = true;
    }

    if (!affectedNodeIds.size) {
      return undefined;
    }

    // Commits are O(number of changes), previous snapshots are kept intact. If any assertion below fails, the
    // committed index is discarded and the previous version is still intact.
    const committedChildIds = commitBackwardReferenceIds(nextChildIds);

    const nextSortedChildIds = updateSortedChildIds(this.#state, nextStateReader, affectedNodeIds);

    // Generates `hasPart` and sorted children for nodes upserted or with changed children.
    // This is O(number of properties) per node.
    for (const id of new Set([...affectedNodeIds, ...nextChildIds.sets.keys(), ...nextSortedChildIds.keys()])) {
      const draft = getDraft(id);

      draft &&
        nextState.set(
          id,
          draft.commit(
            committedChildIds.get(id) ?? EMPTY_IDS,
            nextSortedChildIds.get(id) ?? getSortedChildIds(this.#state.get(id))
          )
        );
      draft && affectedNodeIds.add(id);
    }

    assertReferencedNodesInGraph(nextState, nextForwardReferenceIds, affectedNodeIds);

    assertNoPendingParts(pendingParentIds);

    // THINK: Upsert/delete called twice with same node ID in the same transaction?

    this.#backwardReferenceIds = commitBackwardReferenceIds(nextBackwardReferenceIds);
    this.#childIds = committedChildIds;
    this.#forwardReferenceIds = nextForwardReferenceIds.commit();
    this.#state = nextState.commit();

    return new FrozenSet(affectedNodeIds);
  }

  #notifyAll(affectedNodeIds: ReadonlySet<Identifier>) {
    for (const listener of this.#listeners) {
      listener(affectedNodeIds);
    }
  }

  /**
   * Gets an immutable snapshot of all nodes. Snapshots are not affected by subsequent commits.
   */
  getSnapshot(): ReadonlyMap<string, Node> {
    return this.#state;
  }

  /**
   * Gets children of the node with the specified ID from the latest snapshot, sorted by `init.by` in `init.order`.
   *
   * Only `by: 'dateCreated'` is supported: sorted by `dateCreated`. Children without `dateCreated` are sorted last. Children with the
   * same `dateCreated` are sorted by `@id`.
   *
   * `order` is `'asc'` (default if `undefined`) or `'desc'`. Descending order is the exact reverse of ascending order,
   * i.e. children without `dateCreated` are sorted first.
   *
   * Returns an empty iterable if the node does not exist or has no children. This is O(1) regardless of the number of children, children are resolved
   * lazily while iterating, O(1) per child. The iterable can be iterated multiple times and is not affected by
   * subsequent commits.
   */
  getSortedParts(id: Identifier, init: GetSortedPartsInit): Iterable<Node> {
    const safeId = parse(identifierSchema, id);

    const { order } = parse(getSortedPartsInitSchema, init);

    const state = this.#state;
    const sortedChildIds = getSortedChildIds(state.get(safeId));
    const orderedChildIds = order === 'desc' ? sortedChildIds?.reversed() : sortedChildIds;

    return Object.freeze({
      *[Symbol.iterator](): Iterator<Node> {
        if (orderedChildIds) {
          for (const childId of orderedChildIds) {
            yield state.get(childId) as Node;
          }
        }
      }
    });
  }

  /**
   * Subscribes to changes. On every successful commit, the listener will be called with a read-only `Set` of IDs of
   * nodes which are added, updated, or deleted.
   */
  subscribe(listener: StoreListener): () => void {
    if (typeof listener !== 'function') {
      throw new TypeError('listener must be a function');
    }

    this.#listeners.add(listener);

    return () => {
      this.#listeners.delete(listener);
    };
  }
}

export default Store;
export type { GetSortedPartsInit, StoreListener, StoreSource, StoreController, StoreTransaction };
