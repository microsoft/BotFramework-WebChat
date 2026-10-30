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

        transactor(
          Object.freeze({
            delete: (id: Identifier): readonly Identifier[] => {
              const safeId = parse(identifierSchema, id);
              const referencingNodeIds: Identifier[] = [];

              nextState.delete(safeId) && affectedNodeIds.add(safeId);

              for (const node of nextState.values()) {
                const nextNode = removeReference(node, safeId);

                if (nextNode) {
                  const nodeId = nextNode['@id'];

                  nextState.set(nodeId, nextNode);
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

          this.#state = nextState;

          this.#notifyAll();
        }
      }
    };

    source.start(controller);
  }

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
