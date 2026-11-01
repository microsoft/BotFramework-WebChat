import { boolean, is, object, optional, parse, pipe, readonly, type InferInput } from 'valibot';
import assertInversePartRelationship from './assertion/assertInversePartRelationship.ts';
import assertNotSelfPart from './assertion/assertNotSelfPart.ts';
import assertReferencedNodesInGraph from './assertion/assertReferencedNodesInGraph.ts';
import assertUniquePositionInParts from './assertion/assertUniquePositionInParts.ts';
import fixPartMembership from './automatic/fixPartMembership.ts';
import type { Node } from './node/Node.ts';
import { identifierSchema, type Identifier } from './node/NodeIdentifier.ts';
import { nodeReferenceSchema } from './node/NodeReference.ts';
import createReadonlySet from './private/createReadonlySet.ts';
import createNode from './private/createNode.ts';

type StoreListener = (affectedNodeIds: ReadonlySet<Identifier>) => void;

interface StoreSource {
  start(controller: StoreController): void;
}

const storeEditInitSchema = pipe(
  object({
    /**
     * When `true`, `hasPart` and `isPartOf` will be automatically updated on commit so they are inverse of each other.
     *
     * Regardless of this option, the commit will fail if `hasPart` and `isPartOf` are not inverse of each other.
     */
    autoRelationship: optional(boolean('autoRelationship must be boolean'))
  }),
  readonly()
);

type StoreEditInit = InferInput<typeof storeEditInitSchema>;

interface StoreController {
  edit(transactor: (transaction: StoreTransaction) => void, init?: StoreEditInit | undefined): void;
}

interface StoreTransaction {
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

/**
 * Updates forward and backward reference maps with the new set of reference IDs of a node.
 */
function setReferenceIds(
  forwardReferenceIds: Map<Identifier, Set<Identifier>>,
  backwardReferenceIds: Map<Identifier, Set<Identifier>>,
  id: Identifier,
  nextReferenceIds: Set<Identifier>
): void {
  for (const referenceId of forwardReferenceIds.get(id) ?? []) {
    const referencingIds = backwardReferenceIds.get(referenceId);

    if (referencingIds) {
      referencingIds.delete(id);
      referencingIds.size || backwardReferenceIds.delete(referenceId);
    }
  }

  nextReferenceIds.size ? forwardReferenceIds.set(id, nextReferenceIds) : forwardReferenceIds.delete(id);

  for (const referenceId of nextReferenceIds) {
    const referencingIds = backwardReferenceIds.get(referenceId);

    referencingIds ? referencingIds.add(id) : backwardReferenceIds.set(referenceId, new Set([id]));
  }
}

function cloneReferenceIds(referenceIds: Map<Identifier, Set<Identifier>>): Map<Identifier, Set<Identifier>> {
  return new Map(Array.from(referenceIds, ([id, ids]) => [id, new Set(ids)]));
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
      edit: (transactor, init) => {
        const { autoRelationship } = parse(optional(storeEditInitSchema, {}), init);
        const affectedNodeIds = new Set<Identifier>();

        // All edits are done on a copy. If the transactor throws, the copy is discarded and the state is not changed.
        const nextState = new Map(this.#state);
        const nextBackwardReferenceIds = cloneReferenceIds(this.#backwardReferenceIds);
        const nextForwardReferenceIds = cloneReferenceIds(this.#forwardReferenceIds);

        const setNode = (node: Node): void => {
          const id = node['@id'];

          nextState.set(id, node);
          setReferenceIds(nextForwardReferenceIds, nextBackwardReferenceIds, id, getReferenceIds(node));
          affectedNodeIds.add(id);
        };

        transactor(
          Object.freeze({
            delete: (id: Identifier): void => {
              const safeId = parse(identifierSchema, id);

              nextState.delete(safeId) && affectedNodeIds.add(safeId);

              setReferenceIds(nextForwardReferenceIds, nextBackwardReferenceIds, safeId, new Set());

              // Copy before iterating as the set will be modified while removing references.
              for (const nodeId of Array.from(nextBackwardReferenceIds.get(safeId) ?? [])) {
                const node = nextState.get(nodeId);
                const nextNode = node && removeReference(node, safeId);

                nextNode && setNode(nextNode);
              }
            },
            upsert: (id: Identifier, updater: (node: Node | undefined) => Node): void => {
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

        if (affectedNodeIds.size) {
          autoRelationship && fixPartMembership(this.#state, nextState, affectedNodeIds, setNode);

          assertReferencedNodesInGraph(nextState, nextForwardReferenceIds, affectedNodeIds);
          assertInversePartRelationship(nextState, nextBackwardReferenceIds, affectedNodeIds);
          assertUniquePositionInParts(nextState, affectedNodeIds);

          // THINK: Upsert/delete called twice with same node ID in the same transaction?

          this.#backwardReferenceIds = nextBackwardReferenceIds;
          this.#forwardReferenceIds = nextForwardReferenceIds;
          this.#state = nextState;

          this.#notifyAll(createReadonlySet(affectedNodeIds));
        }
      }
    };

    source.start(controller);
  }

  /** Key is the node being referenced, values are IDs of nodes which reference the key node. */
  #backwardReferenceIds: Map<Identifier, Set<Identifier>> = new Map();
  /** Key is the node containing node references, values are IDs of nodes being referenced by the key node. */
  #forwardReferenceIds: Map<Identifier, Set<Identifier>> = new Map();
  #listeners: Set<StoreListener> = new Set<StoreListener>();
  #state: Map<string, Node> = new Map();

  #notifyAll(affectedNodeIds: ReadonlySet<Identifier>) {
    for (const listener of this.#listeners) {
      listener(affectedNodeIds);
    }
  }

  getSnapshot(): Map<string, Node> {
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
export type { StoreEditInit, StoreListener, StoreSource, StoreController, StoreTransaction };
