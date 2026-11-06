import { is, literal, object, parse, pipe, readonly, type InferInput } from 'valibot';
import assertNotSelfPart from './assertion/assertNotSelfPart.ts';
import assertReferencedNodesInGraph from './assertion/assertReferencedNodesInGraph.ts';
import type { Node } from './node/Node.ts';
import { identifierSchema, type Identifier } from './node/NodeIdentifier.ts';
import { nodeReferenceSchema } from './node/NodeReference.ts';
import attachHasPart from './private/attachHasPart.ts';
import createReadonlyMap, { type ReadWriteMap, type VersionedReadonlyMap } from './structure/createReadonlyMap.ts';
import createReadonlySet, { type ReadWriteSet, type VersionedReadonlySet } from './structure/createReadonlySet.ts';
import createNode from './private/createNode.ts';
import createReadonlySkipList, {
  type ReadWriteSkipList,
  type VersionedReadonlySkipList
} from './structure/createReadonlySkipList.ts';
import { getNodeSetIds } from './structure/createReadonlyNodeSet.ts';
import getPartIds from './private/getPartIds.ts';
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

const EMPTY_IDS: ReadonlySet<Identifier> = createReadonlySet<Identifier>([]);

const getSortedPartsInitSchema = pipe(
  object({
    // Only `dateCreated` is supported for now.
    sortBy: literal('dateCreated', '"sortBy" must be "dateCreated"')
  }),
  readonly()
);

type GetSortedPartsInit = InferInput<typeof getSortedPartsInitSchema>;

function isReferenceTo(id: Identifier, value: unknown): boolean {
  return is(nodeReferenceSchema, value) && value['@id'] === id;
}

/**
 * Gets IDs of all nodes referenced by the specified node.
 */
function getReferenceIds(node: Node): Set<Identifier> {
  const referenceIds = new Set<Identifier>();

  for (const [key, value] of Object.entries(node)) {
    const nodeSetIds = getNodeSetIds(value);

    if (nodeSetIds) {
      // `hasPart` and `isPartOf` contain node references only, add their IDs without checking.
      for (const id of nodeSetIds) {
        referenceIds.add(id);
      }
    } else if (
      key !== '@context' &&
      key !== '@id' &&
      key !== '@type' &&
      (value instanceof Set || Array.isArray(value))
    ) {
      for (const item of value) {
        is(nodeReferenceSchema, item) && referenceIds.add(item['@id']);
      }
    }
  }

  return referenceIds;
}

type ReferenceIds = VersionedReadonlyMap<Identifier, VersionedReadonlySet<Identifier>>;

/**
 * Backward reference IDs (or child IDs) being modified in a transaction.
 *
 * A node could be referenced by many nodes (e.g. a conversation referenced by all messages). Instead of copying, sets
 * being modified are mutated via an overlay and kept in `sets` until commit.
 */
type MutableBackwardReferenceIds = {
  readonly map: ReadWriteMap<Identifier, VersionedReadonlySet<Identifier>>;
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
      (referencingIds = (backwardReferenceIds.map.get(id) ?? createReadonlySet<Identifier>([])).mutate())
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
  forwardReferenceIds: ReadWriteMap<Identifier, VersionedReadonlySet<Identifier>>,
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

  nextReferenceIds.size
    ? forwardReferenceIds.set(id, createReadonlySet(nextReferenceIds))
    : forwardReferenceIds.delete(id);
}

/**
 * Gets entries of the node, excluding the generated `hasPart`.
 */
function getEntriesWithoutHasPart(node: Node): [string, unknown][] {
  return Object.entries(node).filter(([key]) => key !== 'hasPart');
}

/**
 * Removes all references to the specified node ID.
 *
 * @returns A new node without `hasPart` if references are removed, otherwise, `undefined`.
 */
function removeReference(node: Node, id: Identifier): Node | undefined {
  let changed = false;
  const nextEntries: [string, unknown][] = [];

  for (const [key, value] of getEntriesWithoutHasPart(node)) {
    if (key === '@context' || key === '@id' || key === '@type') {
      nextEntries.push([key, value]);
    } else if (value instanceof Set || Array.isArray(value)) {
      const values: readonly unknown[] = Array.from(value);
      const nextValues = values.filter(value => !isReferenceTo(id, value));

      if (nextValues.length === values.length) {
        nextEntries.push([key, value]);
      } else {
        changed = true;

        // OPINION: Empty property value is same as if the property is removed.
        nextValues.length && nextEntries.push([key, value instanceof Set ? new Set(nextValues) : nextValues]);
      }
    } else {
      nextEntries.push([key, value]);
    }
  }

  return changed ? createNode(Object.fromEntries(nextEntries)) : undefined;
}

/**
 * Adds or removes a parent from `isPartOf` of the node.
 *
 * @returns A new node without `hasPart`.
 */
function setPartOf(node: Node, parentId: Identifier, included: boolean): Node {
  const parentIds = new Set(getPartIds(node, 'isPartOf'));

  included ? parentIds.add(parentId) : parentIds.delete(parentId);

  // OPINION: Empty property value is same as if the property is removed.
  return createNode(
    Object.fromEntries([
      ...getEntriesWithoutHasPart(node).filter(([key]) => key !== 'isPartOf'),
      ...(parentIds.size ? [['isPartOf', new Set(Array.from(parentIds, id => ({ '@id': id })))] as const] : [])
    ])
  );
}

/**
 * Updates sorted children of parents which children are added, removed, or changed `dateCreated`.
 *
 * Uses `mutate()` and `commit()`, the sorted children are not copied. Removal is expected O(1), insertion is O(1) when
 * appending to the end, otherwise, expected O(log n), see `insertSortedChild()` for details.
 *
 * @returns Key is the ID of the parent, value is the new sorted child IDs.
 */
function updateSortedChildIds(
  prevState: ReadonlyMap<string, Node>,
  nextState: ReadonlyMap<string, Node>,
  affectedNodeIds: ReadonlySet<Identifier>
): Map<Identifier, VersionedReadonlySkipList<Identifier>> {
  const insertions: [Identifier, Identifier][] = [];
  const removals: [Identifier, Identifier][] = [];
  const sortedChildIds = new Map<Identifier, ReadWriteSkipList<Identifier>>();

  for (const id of affectedNodeIds) {
    const prevNode = prevState.get(id);
    const nextNode = nextState.get(id);
    const dateCreatedChanged = prevNode?.dateCreated !== nextNode?.dateCreated;
    const prevParentIds = getPartIds(prevNode, 'isPartOf');
    const parentIds = getPartIds(nextNode, 'isPartOf');

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
          getSortedChildIds(prevState.get(parentId)) ?? createReadonlySkipList<Identifier>()
        ).mutate())
      );

    return mutableSortedChildIds;
  };

  // Removes first, children remaining are either unchanged or new, so they can be compared using the next state.
  for (const [parentId, id] of removals) {
    removeSortedChild(mutate(parentId), id);
  }

  for (const [parentId, id] of insertions) {
    insertSortedChild(
      mutate(parentId),
      id,
      nextState.get(id)?.dateCreated,
      childId => nextState.get(childId)?.dateCreated
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
  #backwardReferenceIds: ReferenceIds = createReadonlyMap([]);
  /** Key is the parent node, values are IDs of children which have the parent in `isPartOf`. */
  #childIds: ReferenceIds = createReadonlyMap([]);
  /** Key is the node containing node references, values are IDs of nodes being referenced by the key node. */
  #forwardReferenceIds: ReferenceIds = createReadonlyMap([]);
  #listeners: Set<StoreListener> = new Set<StoreListener>();
  #state: VersionedReadonlyMap<string, Node> = createReadonlyMap([]);

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

    // Gets the node with `hasPart` reflecting changes made in this transaction.
    // Nodes in `nextState` with changed children have their `hasPart` regenerated on commit.
    const getNode = (id: Identifier): Node | undefined => {
      const node = nextState.get(id);
      const childIds = nextChildIds.sets.get(id);

      return node && childIds ? attachHasPart(node, createReadonlySet(childIds), getSortedChildIds(node)) : node;
    };

    const setPendingChild = (parentId: Identifier, childId: Identifier, included: boolean): void => {
      let parentIds = pendingParentIds.get(childId);

      parentIds || pendingParentIds.set(childId, (parentIds = new Set()));
      included ? parentIds.add(parentId) : parentIds.delete(parentId);
      mutateReferencingIds(nextChildIds, parentId)[included ? 'add' : 'delete'](childId);
    };

    // The node must not have `hasPart`, it will be generated from `isPartOf` of its children.
    const setNode = (node: Node): void => {
      const id = node['@id'];
      const parentIds = getPartIds(node, 'isPartOf');
      const prevParentIds = getPartIds(nextState.get(id), 'isPartOf');

      for (const parentId of prevParentIds) {
        parentIds.has(parentId) || mutateReferencingIds(nextChildIds, parentId).delete(id);
      }

      for (const parentId of parentIds) {
        prevParentIds.has(parentId) || mutateReferencingIds(nextChildIds, parentId).add(id);
      }

      // If children are changed in this transaction, `hasPart` and sorted children will be generated on commit.
      nextState.set(id, attachHasPart(node, nextChildIds.map.get(id) ?? EMPTY_IDS, undefined));
      setReferenceIds(nextForwardReferenceIds, nextBackwardReferenceIds, id, getReferenceIds(node));
      affectedNodeIds.add(id);
    };

    try {
      transactor(
        Object.freeze({
          delete: (id: Identifier): void => {
            assertNotEnded();

            const safeId = parse(identifierSchema, id);
            const node = nextState.get(safeId);

            for (const parentId of getPartIds(node, 'isPartOf')) {
              mutateReferencingIds(nextChildIds, parentId).delete(safeId);
            }

            for (const parentId of pendingParentIds.get(safeId) ?? []) {
              mutateReferencingIds(nextChildIds, parentId).delete(safeId);
            }

            for (const [childId, parentIds] of pendingParentIds) {
              parentIds.delete(safeId) && mutateReferencingIds(nextChildIds, safeId).delete(childId);
            }

            pendingParentIds.delete(safeId);
            nextState.delete(safeId) && affectedNodeIds.add(safeId);

            setReferenceIds(nextForwardReferenceIds, nextBackwardReferenceIds, safeId, EMPTY_IDS);

            // Children reference the deleted node via `isPartOf`, removing references will also remove them from
            // `hasPart` of the deleted node.
            // Copy before iterating as the set will be modified while removing references.
            for (const nodeId of Array.from(getReferencingIds(nextBackwardReferenceIds, safeId))) {
              const node = nextState.get(nodeId);
              const nextNode = node && removeReference(node, safeId);

              nextNode && setNode(nextNode);
            }
          },
          upsert: (id: Identifier, updater: (node: Node | undefined) => Node): void => {
            assertNotEnded();

            const safeId = parse(identifierSchema, id);

            if (typeof updater !== 'function') {
              throw new TypeError('updater must be a function');
            }

            let safeNode = createNode(updater(getNode(safeId)));

            if (safeNode['@id'] !== safeId) {
              throw new Error(`Node returned from updater must have @id of "${safeId}", cannot change @id`);
            }

            assertNotSelfPart(safeNode);

            // The node is in `hasPart` of parents upserted before the node is in the graph, mirror them now.
            for (const parentId of pendingParentIds.get(safeId) ?? []) {
              safeNode = setPartOf(safeNode, parentId, true);
            }

            pendingParentIds.delete(safeId);

            // Copy before iterating as the set will be modified while mirroring.
            const childIds = getPartIds(safeNode, 'hasPart');
            const prevChildIds = new Set(getReferencingIds(nextChildIds, safeId));

            // `hasPart` is not stored, it is mirrored to `isPartOf` of children below.
            setNode(attachHasPart(safeNode, EMPTY_IDS, undefined));

            for (const [childId, included] of [
              ...Array.from(prevChildIds)
                .filter(childId => !childIds.has(childId))
                .map(childId => [childId, false] as const),
              ...Array.from(childIds)
                .filter(childId => !prevChildIds.has(childId))
                .map(childId => [childId, true] as const)
            ]) {
              const child = nextState.get(childId);

              child ? setNode(setPartOf(child, safeId, included)) : setPendingChild(safeId, childId, included);
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

    const nextSortedChildIds = updateSortedChildIds(this.#state, nextState, affectedNodeIds);

    // Generates `hasPart` and sorted children for nodes upserted or with changed children.
    // This is O(number of properties) per node.
    for (const id of new Set([...affectedNodeIds, ...nextChildIds.sets.keys(), ...nextSortedChildIds.keys()])) {
      const node = nextState.get(id);

      node &&
        nextState.set(
          id,
          attachHasPart(
            node,
            committedChildIds.get(id) ?? EMPTY_IDS,
            nextSortedChildIds.get(id) ?? getSortedChildIds(this.#state.get(id))
          )
        );
      node && affectedNodeIds.add(id);
    }

    assertReferencedNodesInGraph(nextState, nextForwardReferenceIds, affectedNodeIds);

    for (const [childId, [parentId]] of pendingParentIds) {
      if (parentId) {
        throw new Error(`Node "${parentId}" has part "${childId}" which is not in the graph`);
      }
    }

    // THINK: Upsert/delete called twice with same node ID in the same transaction?

    this.#backwardReferenceIds = commitBackwardReferenceIds(nextBackwardReferenceIds);
    this.#childIds = committedChildIds;
    this.#forwardReferenceIds = nextForwardReferenceIds.commit();
    this.#state = nextState.commit();

    return createReadonlySet(affectedNodeIds);
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
   * Gets children of the node with the specified ID from the latest snapshot, sorted by `init.sortBy`.
   *
   * Only `sortBy: 'dateCreated'` is supported: sorted by `dateCreated`. Children without `dateCreated` are sorted last. Children with the
   * same `dateCreated` are sorted by `@id`.
   *
   * Returns an empty iterable if the node does not exist or has no children. This is O(1) regardless of the number of children, children are resolved
   * lazily while iterating, O(1) per child. The iterable can be iterated multiple times and is not affected by
   * subsequent commits.
   */
  getSortedParts(id: Identifier, init: GetSortedPartsInit): Iterable<Node> {
    const safeId = parse(identifierSchema, id);

    parse(getSortedPartsInitSchema, init);

    const state = this.#state;
    const sortedChildIds = getSortedChildIds(state.get(safeId));

    return Object.freeze({
      *[Symbol.iterator](): Iterator<Node> {
        if (sortedChildIds) {
          for (const childId of sortedChildIds) {
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
