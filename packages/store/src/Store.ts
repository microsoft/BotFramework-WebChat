import {
  function_,
  is,
  literal,
  looseObject,
  object,
  optional,
  parse,
  picklist,
  pipe,
  readonly,
  type InferInput
} from 'valibot';
import assertIdentifierNotId from './assertion/assertIdentifierNotId.ts';
import assertNoPendingParts from './assertion/assertNoPendingParts.ts';
import assertNotSelfPart from './assertion/assertNotSelfPart.ts';
import assertReferencedNodesInGraph from './assertion/assertReferencedNodesInGraph.ts';
import type { Node, UpsertNode } from './node/Node.ts';
import { identifierSchema, type NodeIdentifier } from './node/NodeIdentifier.ts';
import FrozenMap, { type ReadWriteMap } from './structure/FrozenMap.ts';
import FrozenSet, { type ReadWriteSet } from './structure/FrozenSet.ts';
import createDraftNode from './private/createDraftNode.ts';
import Draft from './private/Draft.ts';
import type { DraftNode } from './private/DraftNode.ts';
import type { FrozenNode } from './private/FrozenNode.ts';
import FrozenSkipList, { type ReadWriteSkipList } from './structure/FrozenSkipList.ts';
import { getHasPartIds, getIsPartOfIds } from './private/getPartIds.ts';
import { getDateCreatedTime, getSortedChildIds } from './private/hiddenNodeState.ts';
import { updateIdentifierIndex } from './private/identifierIndex.ts';
import { insertSortedChild, removeSortedChild } from './private/sortedChildIds.ts';

type StoreListener = (affectedNodeIds: ReadonlySet<NodeIdentifier>) => void;

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
   *
   * The transactor must be synchronous. If it returns a then-able (e.g. Promise), the edit throws and all changes are
   * discarded. The synchronous part of the Promise could succeed while the asynchronous part would fail, the caller
   * will not be very aware of what's going on.
   */
  edit(transactor: (transaction: StoreTransaction) => void): void;
}

interface StoreTransaction {
  /**
   * Deletes a node and removes all references pointing to the deleted node from other nodes.
   *
   * `delete()` cannot be called inside an updater of `upsert()`.
   */
  delete(id: NodeIdentifier): void;

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
   *
   * Alternate identifiers: `identifier` is a set of alternate identifiers of the node, it can be changed by upsert, while
   * `@id` cannot be changed. It must not contain `@id` of the node, and every identifier (either `@id` or alternate
   * identifier) must identify at most one node in the graph. It is only used by `queryByIdentifier()`.
   *
   * Other than named properties (e.g. `@id`, `@type`), all property values must be an array, e.g. `text: ['Hello']`.
   *
   * The updater must be a pure function of the node it receives. Transaction methods (i.e. `upsert()` and `delete()`)
   * cannot be called inside the updater, they will throw without making any changes. Reading the store (e.g.
   * `getSnapshot()`) inside the updater is allowed.
   */
  upsert<T>(id: NodeIdentifier, updater: (node: Node | undefined) => UpsertNode<T>): void;
}

const EMPTY_IDS: FrozenSet<NodeIdentifier> = new FrozenSet<NodeIdentifier>([]);

const isThenable = is.bind(null, looseObject({ then: function_() }));

const getSortedPartsInitSchema = pipe(
  object({
    // Only `dateCreated` is supported for now.
    by: literal('dateCreated', '"by" must be "dateCreated"'),
    order: optional(picklist(['asc', 'desc'], '"order" must be "asc", "desc", or undefined'))
  }),
  readonly()
);

type GetSortedPartsInit = InferInput<typeof getSortedPartsInitSchema>;

type ReferenceIds = FrozenMap<NodeIdentifier, FrozenSet<NodeIdentifier>>;

/**
 * Backward reference IDs (or child IDs) being modified in a transaction.
 *
 * A node could be referenced by many nodes (e.g. a conversation referenced by all messages). Instead of copying, sets
 * being modified are mutated via an overlay and kept in `sets` until commit.
 */
type MutableBackwardReferenceIds = {
  readonly map: ReadWriteMap<NodeIdentifier, FrozenSet<NodeIdentifier>>;
  readonly sets: Map<NodeIdentifier, ReadWriteSet<NodeIdentifier>>;
};

function getReferencingIds(
  backwardReferenceIds: MutableBackwardReferenceIds,
  id: NodeIdentifier
): ReadonlySet<NodeIdentifier> {
  return backwardReferenceIds.sets.get(id) ?? backwardReferenceIds.map.get(id) ?? EMPTY_IDS;
}

function mutateReferencingIds(
  backwardReferenceIds: MutableBackwardReferenceIds,
  id: NodeIdentifier
): ReadWriteSet<NodeIdentifier> {
  let referencingIds = backwardReferenceIds.sets.get(id);

  // A new empty set is created every time, mutating a shared empty set would make other mutations of it O(size).
  referencingIds ||
    backwardReferenceIds.sets.set(
      id,
      (referencingIds = (backwardReferenceIds.map.get(id) ?? new FrozenSet<NodeIdentifier>([])).mutate())
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
  forwardReferenceIds: ReadWriteMap<NodeIdentifier, FrozenSet<NodeIdentifier>>,
  backwardReferenceIds: MutableBackwardReferenceIds,
  id: NodeIdentifier,
  nextReferenceIds: ReadonlySet<NodeIdentifier>
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
  getDateCreatedTime(id: NodeIdentifier): number;
  /** Gets IDs of parents in `isPartOf` of the node, empty if the node does not exist. */
  getPartOfIds(id: NodeIdentifier): ReadonlySet<NodeIdentifier>;
  has(id: NodeIdentifier): boolean;
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
  prevState: ReadonlyMap<string, FrozenNode>,
  nextState: NextStateReader,
  affectedNodeIds: ReadonlySet<NodeIdentifier>
): Map<NodeIdentifier, FrozenSkipList<NodeIdentifier>> {
  const insertions: [NodeIdentifier, NodeIdentifier][] = [];
  const removals: [NodeIdentifier, NodeIdentifier][] = [];
  const sortedChildIds = new Map<NodeIdentifier, ReadWriteSkipList<NodeIdentifier>>();

  for (const id of affectedNodeIds) {
    const prevNode = prevState.get(id);
    const dateCreatedChanged = getDateCreatedTime(prevNode) !== nextState.getDateCreatedTime(id);
    const prevParentIds = getIsPartOfIds(prevNode);
    const parentIds = nextState.getPartOfIds(id);

    for (const parentId of prevParentIds) {
      (dateCreatedChanged || !parentIds.has(parentId)) && nextState.has(parentId) && removals.push([parentId, id]);
    }

    for (const parentId of parentIds) {
      (dateCreatedChanged || !prevParentIds.has(parentId)) && insertions.push([parentId, id]);
    }
  }

  // A new empty list is created for every parent, mutating a shared empty list would make other mutations of it O(size).
  const mutate = (parentId: NodeIdentifier): ReadWriteSkipList<NodeIdentifier> => {
    let mutableSortedChildIds = sortedChildIds.get(parentId);

    mutableSortedChildIds ||
      sortedChildIds.set(
        parentId,
        (mutableSortedChildIds = (
          getSortedChildIds(prevState.get(parentId)) ?? new FrozenSkipList<NodeIdentifier>()
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

        let affectedNodeIds: ReadonlySet<NodeIdentifier> | undefined;

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
  /** Key is an alternate identifier (in `identifier` property), value is `@id` of the node which has it. */
  #identifierIndex: FrozenMap<NodeIdentifier, NodeIdentifier> = new FrozenMap([]);
  #listeners: Set<StoreListener> = new Set<StoreListener>();
  #state: FrozenMap<string, FrozenNode> = new FrozenMap([]);

  /**
   * Runs the transactor and commits changes to the store.
   *
   * Multiple nodes can be added at once and they could cross reference each other. All nodes are added at once, part
   * relationships are mirrored, then the graph integrity is verified.
   *
   * @returns IDs of nodes which are added, updated, or deleted, plus their alternate identifiers before and after the
   *          change, or `undefined` if nothing is changed.
   */
  #commit(transactor: (transaction: StoreTransaction) => void): ReadonlySet<NodeIdentifier> | undefined {
    const affectedNodeIds = new Set<NodeIdentifier>();
    let ended = false;

    // OPINION: Updaters must be pure functions of the node they receive, transaction methods cannot be called while an
    //          updater is running. More restriction at first, relax later.
    let updating = false;

    // Key is the ID of children in `hasPart` which are not in the graph yet, value is IDs of their parents.
    // When the child is upserted, the parents will be added to its `isPartOf`.
    const pendingParentIds = new Map<NodeIdentifier, Set<NodeIdentifier>>();

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

    const assertNotUpdating = (methodName: 'delete' | 'upsert'): void => {
      if (updating) {
        throw new Error(`${methodName}() cannot be called inside an updater`);
      }
    };

    // Nodes modified in this transaction. Changes are kept in drafts, and nodes are built once on commit.
    const drafts = new Map<NodeIdentifier, Draft>();

    const nextStateReader: NextStateReader = Object.freeze({
      getDateCreatedTime: (id: NodeIdentifier): number =>
        drafts.get(id)?.dateCreatedTime ?? getDateCreatedTime(nextState.get(id)),
      getPartOfIds: (id: NodeIdentifier): ReadonlySet<NodeIdentifier> =>
        drafts.get(id)?.partOfIds ?? getIsPartOfIds(nextState.get(id)),
      has: (id: NodeIdentifier): boolean => drafts.has(id) || nextState.has(id)
    });

    // Gets the draft of the node, or a new draft if the node is not modified in this transaction yet.
    // The new draft is not kept until `setDraft()` is called.
    const getDraft = (id: NodeIdentifier): Draft | undefined => {
      const node = drafts.get(id) ? undefined : nextState.get(id);

      return drafts.get(id) ?? (node && new Draft(node));
    };

    // Gets child IDs of the node as a frozen set, in O(number of changes) without copying.
    // If children are being modified, changes are committed and a new overlay is started on top of it.
    const getChildIds = (id: NodeIdentifier): FrozenSet<NodeIdentifier> => {
      const childIds = nextChildIds.sets.get(id);

      if (childIds) {
        const committedChildIds = childIds.commit();

        nextChildIds.sets.set(id, committedChildIds.mutate());

        return committedChildIds;
      }

      return nextChildIds.map.get(id) ?? EMPTY_IDS;
    };

    const setPendingChild = (parentId: NodeIdentifier, childId: NodeIdentifier, included: boolean): void => {
      let parentIds = pendingParentIds.get(childId);

      parentIds || pendingParentIds.set(childId, (parentIds = new Set()));
      included ? parentIds.add(parentId) : parentIds.delete(parentId);
      mutateReferencingIds(nextChildIds, parentId)[included ? 'add' : 'delete'](childId);
    };

    // Keeps the draft and updates references. Callers must update `nextChildIds` if `isPartOf` is changed.
    const setDraft = (draft: Draft): void => {
      const { id } = draft;

      drafts.set(id, draft);
      setReferenceIds(nextForwardReferenceIds, nextBackwardReferenceIds, id, draft.getReferenceIds());
      affectedNodeIds.add(id);
    };

    // Adds or removes a parent from `isPartOf` of the child, and mirrors it to children of the parent.
    const setPartOf = (child: Draft, parentId: NodeIdentifier, included: boolean): void => {
      child.setPartOf(parentId, included) &&
        mutateReferencingIds(nextChildIds, parentId)[included ? 'add' : 'delete'](child.id);
      setDraft(child);
    };

    try {
      const result: unknown = transactor(
        Object.freeze({
          delete: (id: NodeIdentifier): void => {
            assertNotEnded();
            assertNotUpdating('delete');

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
                const isChild = draft.partOfIds.has(safeId);

                if (draft.removeReferencesTo(safeId)) {
                  isChild && mutateReferencingIds(nextChildIds, safeId).delete(nodeId);
                  setDraft(draft);
                }
              }
            }
          },
          upsert: <T>(id: NodeIdentifier, updater: (node: Node | undefined) => UpsertNode<T>): void => {
            assertNotEnded();
            assertNotUpdating('upsert');

            const safeId = parse(identifierSchema, id);

            if (typeof updater !== 'function') {
              throw new TypeError('updater must be a function');
            }

            // No other changes can be made while the updater is running, so children are still current after the
            // updater returns.
            const childIdsInGraph = getChildIds(safeId);
            const draftToRead = drafts.has(safeId) || nextChildIds.sets.has(safeId) ? getDraft(safeId) : undefined;

            // Clean read: the node in the graph is frozen and up-to-date.
            // Dirty read: a new unfrozen copy with changes made in this transaction, O(number of properties).
            const node: Node | undefined = draftToRead?.read(childIdsInGraph) ?? nextState.get(safeId);

            // Children shown to the updater. A node not in the graph is shown as `undefined`, children which joined it
            // via their `isPartOf` before it is in the graph are not shown, they are kept and not removed by the diff.
            const shownChildIds = node ? childIdsInGraph : EMPTY_IDS;
            let safeNode: DraftNode;

            updating = true;

            try {
              // Reading the returned node could call userland code (e.g. getters), it must be read inside the lock.
              safeNode = createDraftNode(updater(node));
            } finally {
              updating = false;

              // OPINION: The node is writable only inside the updater, it is locked after the updater returns or throws.
              node && Object.freeze(node);
            }

            if (safeNode['@id'] !== safeId) {
              throw new Error(`Node returned from updater must have @id of "${safeId}", cannot change @id`);
            }

            assertIdentifierNotId(safeNode);
            assertNotSelfPart(safeNode);

            // Read before the draft takes ownership of the node, `hasPart` is regenerated on commit.
            const childIds = getHasPartIds(safeNode);
            const draft = new Draft(safeNode);

            // The node is in `hasPart` of parents upserted before the node is in the graph, mirror them now.
            for (const parentId of pendingParentIds.get(safeId) ?? []) {
              draft.setPartOf(parentId, true);
            }

            pendingParentIds.delete(safeId);

            const parentIds = draft.partOfIds;
            const prevParentIds = nextStateReader.getPartOfIds(safeId);

            // Unchanged `isPartOf` passed back from the updater keeps the same IDs object, no need to diff.
            if (parentIds !== prevParentIds) {
              for (const parentId of prevParentIds) {
                parentIds.has(parentId) || mutateReferencingIds(nextChildIds, parentId).delete(safeId);
              }

              for (const parentId of parentIds) {
                prevParentIds.has(parentId) || mutateReferencingIds(nextChildIds, parentId).add(safeId);
              }
            }

            // `hasPart` is not stored, it is mirrored to `isPartOf` of children below.
            setDraft(draft);

            // Unchanged `hasPart` passed back from the updater keeps the same IDs object, no need to diff. Otherwise,
            // diff against children shown to the updater, it is frozen and is not modified while mirroring.
            if (childIds !== shownChildIds && (childIds.size || shownChildIds.size)) {
              for (const [childId, included] of [
                ...Array.from(shownChildIds)
                  .filter(childId => !childIds.has(childId))
                  .map(childId => [childId, false] as const),
                ...Array.from(childIds)
                  .filter(childId => !shownChildIds.has(childId))
                  .map(childId => [childId, true] as const)
              ]) {
                const child = getDraft(childId);

                child ? setPartOf(child, safeId, included) : setPendingChild(safeId, childId, included);
              }
            }
          }
        })
      );

      // The transactor must be synchronous. If a then-able (e.g. Promise) is returned, the synchronous part of the
      // Promise could succeed while the asynchronous part would fail, the caller will not be very aware of what's going
      // on. Throwing here discards all changes made in the synchronous part.
      if (isThenable(result)) {
        throw new TypeError('transactor must not return a then-able (e.g. Promise), it must be synchronous');
      }
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

    const nextIdentifierIndex = this.#identifierIndex.mutate();
    const affectedIdentifiers = updateIdentifierIndex(this.#state, nextState, nextIdentifierIndex, affectedNodeIds);

    // THINK: Upsert/delete called twice with same node ID in the same transaction?

    this.#backwardReferenceIds = commitBackwardReferenceIds(nextBackwardReferenceIds);
    this.#childIds = committedChildIds;
    this.#forwardReferenceIds = nextForwardReferenceIds.commit();
    this.#identifierIndex = nextIdentifierIndex.commit();
    this.#state = nextState.commit();

    return new FrozenSet(affectedIdentifiers);
  }

  #notifyAll(affectedNodeIds: ReadonlySet<NodeIdentifier>) {
    for (const listener of this.#listeners) {
      try {
        listener(affectedNodeIds);
      } catch (error) {
        queueMicrotask(() => {
          throw error;
        });
      }
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
  getSortedParts(id: NodeIdentifier, init: GetSortedPartsInit): Iterable<Node> {
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
   * Gets the node from the latest snapshot which `@id` or one of its alternate identifiers (`identifier` property)
   * matches the specified identifier, or `undefined` if not found.
   *
   * This is O(1) regardless of the size of the graph.
   */
  queryByIdentifier(identifier: NodeIdentifier): Node | undefined {
    const safeIdentifier = parse(identifierSchema, identifier);

    const state = this.#state;
    const id = state.has(safeIdentifier) ? safeIdentifier : this.#identifierIndex.get(safeIdentifier);

    return id && state.get(id);
  }

  /**
   * Subscribes to changes. On every successful commit, the listener will be called with a read-only `Set` of IDs of
   * nodes which are added, updated, or deleted, plus their alternate identifiers (`identifier` property) before and
   * after the change.
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
