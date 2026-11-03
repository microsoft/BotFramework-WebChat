import { is, parse } from 'valibot';
import assertInversePartRelationship from './assertion/assertInversePartRelationship.ts';
import assertNotSelfPart from './assertion/assertNotSelfPart.ts';
import assertReferencedNodesInGraph from './assertion/assertReferencedNodesInGraph.ts';
import assertUniquePositionInParts from './assertion/assertUniquePositionInParts.ts';
import fixPartMembership from './automatic/fixPartMembership.ts';
import type { Node } from './node/Node.ts';
import { identifierSchema, type Identifier } from './node/NodeIdentifier.ts';
import { nodeReferenceSchema } from './node/NodeReference.ts';
import createReadonlyMap, { type ReadWriteMap, type VersionedReadonlyMap } from './private/createReadonlyMap.ts';
import createReadonlySet, { type ReadWriteSet, type VersionedReadonlySet } from './private/createReadonlySet.ts';
import createNode from './private/createNode.ts';

type StoreListener = (affectedNodeIds: ReadonlySet<Identifier>) => void;

interface StoreSource {
  start(controller: StoreController): void;
}

interface StoreController {
  edit(transactor: (transaction: StoreTransaction) => void): void;
}

interface StoreTransaction {
  /**
   * Auto-fixes part membership of nodes changed since the start of the transaction or the last call to this function,
   * so `hasPart` and `isPartOf` are inverse of each other. On conflict, addition wins over removal.
   *
   * - Can be called at any time inside the transactor; when nothing has changed since the last fix, it is a no-op
   * - After it returns, nodes passed to updaters are fixed and all changes so far are marked as fixed
   * - Changes made after the call are not fixed until it is called again
   * - All changes to the same node are batched and the node is rebuilt once
   *
   * On commit, regardless of whether this function is called, the commit will fail if `hasPart` and `isPartOf` are not
   * inverse of each other: every child with `isPartOf` pointing to a parent must be in the `hasPart` of the parent, and
   * vice versa.
   */
  autoFixRelationship(): void;

  /**
   * Deletes a node and removes all references pointing to the deleted node from other nodes.
   */
  delete(id: Identifier): void;

  /**
   * Inserts or updates a node. The updater will receive the current node (or `undefined` if not exists).
   * The node returned by the updater must have the same `@id` as the `id` argument.
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
 * Backward reference IDs being modified in a transaction.
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
 * Removes all references to the specified node ID.
 *
 * @returns A new node if references are removed, otherwise, `undefined`.
 */
function removeReference(node: Node, id: Identifier): Node | undefined {
  let changed = false;
  const nextEntries: [string, unknown][] = [];

  for (const [key, value] of Object.entries(node)) {
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

class Store {
  constructor(source: StoreSource) {
    const controller: StoreController = {
      // Multiple nodes can be added at once and they could cross reference each other.
      // We need to add all of the nodes at once, auto-fix relationships, and verify the graph integrity.
      edit: transactor => {
        if (typeof transactor !== 'function') {
          throw new TypeError('transactor must be a function');
        }

        const affectedNodeIds = new Set<Identifier>();
        let ended = false;

        // Key is the ID of nodes changed since the last auto-fix, value is the node right before its first change.
        const unfixedPrevNodes = new Map<Identifier, Node | undefined>();

        // All edits are done on overlays without copying. If the transactor throws, overlays are discarded and the state
        // is not changed.
        const nextState = this.#state.mutate();
        const nextBackwardReferenceIds: MutableBackwardReferenceIds = Object.freeze({
          map: this.#backwardReferenceIds.mutate(),
          sets: new Map()
        });
        const nextForwardReferenceIds = this.#forwardReferenceIds.mutate();

        const markUnfixed = (id: Identifier): void => {
          unfixedPrevNodes.has(id) || unfixedPrevNodes.set(id, nextState.get(id));
        };

        const assertNotEnded = (): void => {
          if (ended) {
            throw new Error('Transaction has ended, it cannot be used after the transactor returns');
          }
        };

        const setNode = (node: Node): void => {
          const id = node['@id'];

          markUnfixed(id);
          nextState.set(id, node);
          setReferenceIds(nextForwardReferenceIds, nextBackwardReferenceIds, id, getReferenceIds(node));
          affectedNodeIds.add(id);
        };

        try {
          transactor(
            Object.freeze({
              autoFixRelationship: (): void => {
                assertNotEnded();

                if (unfixedPrevNodes.size) {
                  // Copy as `setNode()` will mark nodes changed by the auto-fix as unfixed, they are already fixed by this call.
                  const prevNodes = new Map(unfixedPrevNodes);

                  fixPartMembership(prevNodes, nextState, setNode);

                  unfixedPrevNodes.clear();
                }
              },
              delete: (id: Identifier): void => {
                assertNotEnded();

                const safeId = parse(identifierSchema, id);

                markUnfixed(safeId);
                nextState.delete(safeId) && affectedNodeIds.add(safeId);

                setReferenceIds(nextForwardReferenceIds, nextBackwardReferenceIds, safeId, EMPTY_IDS);

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

                const safeNode = createNode(updater(nextState.get(safeId)));

                if (safeNode['@id'] !== safeId) {
                  throw new Error(`Node returned from updater must have @id of "${safeId}", cannot change @id`);
                }

                assertNotSelfPart(safeNode);

                setNode(safeNode);
              }
            })
          );
        } finally {
          ended = true;
        }

        if (affectedNodeIds.size) {
          assertReferencedNodesInGraph(nextState, nextForwardReferenceIds, affectedNodeIds);

          // Asserts the transactor kept `hasPart` and `isPartOf` inverse of each other, either manually or by calling
          // `autoFixRelationship()` after the last change.
          assertInversePartRelationship(this.#state, nextState, affectedNodeIds);
          assertUniquePositionInParts(nextState, affectedNodeIds);

          // THINK: Upsert/delete called twice with same node ID in the same transaction?

          // Commits are O(number of changes), previous snapshots are kept intact.
          this.#backwardReferenceIds = commitBackwardReferenceIds(nextBackwardReferenceIds);
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
