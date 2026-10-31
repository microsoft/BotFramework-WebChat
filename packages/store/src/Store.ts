import { is, parse } from 'valibot';
import { nodeSchema, type Node } from './node/Node.ts';
import { identifierSchema, type Identifier } from './node/NodeIdentifier.ts';
import { nodeReferenceSchema } from './node/NodeReference.ts';

interface StoreSource {
  start(controller: StoreController): void;
}

interface StoreController {
  edit(transactor: (transaction: StoreTransaction) => void): void;
}

interface StoreTransaction {
  /**
   * Deletes a node and removes all references pointing to the deleted node from other nodes.
   *
   * @returns A list of node IDs which their references to the deleted node are removed.
   */
  delete(id: Identifier): readonly Identifier[];

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

  return changed ? parse(nodeSchema, Object.fromEntries(nextEntries)) : undefined;
}

class Store {
  constructor(source: StoreSource) {
    const controller: StoreController = {
      // Multiple nodes can be added at once and they could cross reference each other.
      // We need to add all of the nodes at once, auto-fix relationships, and verify the graph integrity.
      edit: transactor => {
        const affectedNodeIds = new Set<Identifier>();

        // All edits are done on a copy. If the transactor throws, the copy is discarded and the state is not changed.
        const nextState = new Map(this.#state);
        const nextBackwardReferenceIds = cloneReferenceIds(this.#backwardReferenceIds);
        const nextForwardReferenceIds = cloneReferenceIds(this.#forwardReferenceIds);

        transactor(
          Object.freeze({
            delete: (id: Identifier): readonly Identifier[] => {
              const safeId = parse(identifierSchema, id);
              const referencingNodeIds: Identifier[] = [];

              nextState.delete(safeId) && affectedNodeIds.add(safeId);

              setReferenceIds(nextForwardReferenceIds, nextBackwardReferenceIds, safeId, new Set());

              // Copy before iterating as the set will be modified while removing references.
              for (const nodeId of Array.from(nextBackwardReferenceIds.get(safeId) ?? [])) {
                const node = nextState.get(nodeId);
                const nextNode = node && removeReference(node, safeId);

                if (nextNode) {
                  nextState.set(nodeId, nextNode);
                  setReferenceIds(nextForwardReferenceIds, nextBackwardReferenceIds, nodeId, getReferenceIds(nextNode));
                  referencingNodeIds.push(nodeId);
                  affectedNodeIds.add(nodeId);
                }
              }

              return Object.freeze(referencingNodeIds);
            },
            upsert: (id: Identifier, updater: (node: Node | undefined) => Node): void => {
              const safeId = parse(identifierSchema, id);

              if (typeof updater !== 'function') {
                throw new TypeError('updater must be a function');
              }

              const safeNode = parse(nodeSchema, updater(nextState.get(safeId)));

              if (safeNode['@id'] !== safeId) {
                throw new Error(`Node returned from updater must have @id of "${safeId}", cannot change @id`);
              }

              nextState.set(safeId, safeNode);
              setReferenceIds(nextForwardReferenceIds, nextBackwardReferenceIds, safeId, getReferenceIds(safeNode));

              affectedNodeIds.add(safeId);
            }
          })
        );

        if (affectedNodeIds.size) {
          // TODO: Auto-fix relationship for `hasPart` and `isPartOf`.

          // INTEGRITY:
          // - All `hasPart` node must be in the system, and is inverse of `isPartOf`
          // - All `isPartOf` node must be in the system
          // - All node reference which has a blank node identifier (_:*) must be in the system
          // - All nodes participated in the same `isPartOf` grouping must not have conflicting `position` value
          // - THINK: Upsert/delete called twice with same node ID in the same transaction?

          this.#backwardReferenceIds = nextBackwardReferenceIds;
          this.#forwardReferenceIds = nextForwardReferenceIds;
          this.#state = nextState;

          this.#notifyAll();
        }
      }
    };

    source.start(controller);
  }

  /** Key is the node being referenced, values are IDs of nodes which reference the key node. */
  #backwardReferenceIds: Map<Identifier, Set<Identifier>> = new Map();
  /** Key is the node containing node references, values are IDs of nodes being referenced by the key node. */
  #forwardReferenceIds: Map<Identifier, Set<Identifier>> = new Map();
  #listeners: Set<() => void> = new Set<() => void>();
  #state: Map<string, Node> = new Map();

  #notifyAll() {
    for (const listener of this.#listeners) {
      listener();
    }
  }

  getSnapshot(): Map<string, Node> {
    return this.#state;
  }

  subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);

    return () => {
      this.#listeners.delete(listener);
    };
  }
}

export default Store;
export type { StoreSource as StoreController, StoreController as StoreTransactor, StoreTransaction };
