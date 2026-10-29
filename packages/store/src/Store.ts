type Node = {
  readonly '@id': string;
  readonly '@type': Set<string>;
};

interface StoreSource {
  start(controller: StoreController): void;
}

interface StoreController {
  upsertNode<T extends Node>(node: T): void;
}

class Store {
  constructor(source: StoreSource) {
    const controller: StoreController = {
      upsertNode: node => {
        this.#state.set(node['@id'], node);
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
