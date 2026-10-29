import { parse } from 'valibot';
import { nodeSchema, type Node } from './node/Node.ts';

interface StoreSource {
  start(controller: StoreController): void;
}

interface StoreController {
  upsertNode<T extends Node>(node: T): void;
}

class Store {
  constructor(source: StoreSource) {
    const controller: StoreController = {
      // TODO: This should be a transaction, instead of a single operation.
      //       Multiple nodes can be added at once and they could cross reference each other.
      //       We need to add all of the nodes at once, auto-fix relationships, and verify the graph integrity.
      upsertNode: node => {
        const safeNode = parse(nodeSchema, node);

        this.#state.set(safeNode['@id'], safeNode);

        // TODO: Auto-fix relationship for `hasPart` and `isPartOf`.

        // INTEGRITY:
        // - All `hasPart` node must be in the system, and is inverse of `isPartOf`
        // - All `isPartOf` node must be in the system
        // - All node reference which has a blank node identifier (_:*) must be in the system
        // - THINK: Upsert/delete called twice with same node ID in the same transaction?

        this.#notifyAll();
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
export type { StoreSource as StoreController, StoreController as StoreTransactor };
