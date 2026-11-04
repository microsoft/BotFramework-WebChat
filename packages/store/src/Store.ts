import { is, parse } from 'valibot';
import assertNotSelfPart from './assertion/assertNotSelfPart.ts';
import assertReferencedNodesInGraph from './assertion/assertReferencedNodesInGraph.ts';
import assertUniquePositionInParts from './assertion/assertUniquePositionInParts.ts';
import type { Node } from './node/Node.ts';
import { identifierSchema, type Identifier } from './node/NodeIdentifier.ts';
import { nodeReferenceSchema } from './node/NodeReference.ts';
import attachHasPart from './private/attachHasPart.ts';
import createReadonlyMap, { type ReadWriteMap, type VersionedReadonlyMap } from './private/createReadonlyMap.ts';
import createReadonlySet, { type ReadWriteSet, type VersionedReadonlySet } from './private/createReadonlySet.ts';
import createNode from './private/createNode.ts';
import getPartIds from './private/getPartIds.ts';

type StoreListener = (affectedNodeIds: ReadonlySet<Identifier>) => void;

interface StoreSource {
  start(controller: StoreController): void;
}

interface StoreController {
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

function isReferenceTo(id: Identifier, value: unknown): boolean {
  return is(nodeReferenceSchema, value) && value['@id'] === id;
}

/**
 * Gets IDs of all nodes referenced by the specified node.
 */
function getReferenceIds(node: Node): Set<Identifier> {
  const referenceIds = new Set<Identifier>();

  for (const [key, value] of Object.entries(node)) {
    if (key !== '@context' && key !== '@id' && key !== '@type' && (value instanceof Set || Array.isArray(value))) {
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
 *
 * Do not use `Object.entries()`, it will invoke the `hasPart` getter and generate it.
 */
function getEntriesWithoutHasPart(node: Node): [string, unknown][] {
  return Object.keys(node)
    .filter(key => key !== 'hasPart')
    .map(key => [key, Reflect.get(node, key)]);
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

class Store {
  constructor(source: StoreSource) {
    const controller: StoreController = {
      // Multiple nodes can be added at once and they could cross reference each other.
      // We need to add all of the nodes at once, mirror part relationships, and verify the graph integrity.
      edit: transactor => {
        if (typeof transactor !== 'function') {
          throw new TypeError('transactor must be a function');
        }

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

          return node && childIds ? attachHasPart(node, createReadonlySet(childIds)) : node;
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

          // If children are changed in this transaction, `hasPart` will be generated on commit.
          nextState.set(id, attachHasPart(node, nextChildIds.map.get(id) ?? EMPTY_IDS));
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
                setNode(attachHasPart(safeNode, EMPTY_IDS));

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

        if (affectedNodeIds.size) {
          // Commits are O(number of changes), previous snapshots are kept intact. If any assertion below fails, the
          // committed index is discarded and the previous version is still intact.
          const committedChildIds = commitBackwardReferenceIds(nextChildIds);

          // Generates `hasPart` for nodes with changed children, this is O(number of properties) per node.
          for (const id of nextChildIds.sets.keys()) {
            const node = nextState.get(id);

            node && nextState.set(id, attachHasPart(node, committedChildIds.get(id) ?? EMPTY_IDS));
            node && affectedNodeIds.add(id);
          }

          assertReferencedNodesInGraph(nextState, nextForwardReferenceIds, affectedNodeIds);

          for (const [childId, [parentId]] of pendingParentIds) {
            if (parentId) {
              throw new Error(`Node "${parentId}" has part "${childId}" which is not in the graph`);
            }
          }

          assertUniquePositionInParts(nextState, affectedNodeIds);

          // THINK: Upsert/delete called twice with same node ID in the same transaction?

          this.#backwardReferenceIds = commitBackwardReferenceIds(nextBackwardReferenceIds);
          this.#childIds = committedChildIds;
          this.#forwardReferenceIds = nextForwardReferenceIds.commit();
          this.#state = nextState.commit();

          this.#notifyAll(createReadonlySet(affectedNodeIds));
        }
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
export type { StoreListener, StoreSource, StoreController, StoreTransaction };
