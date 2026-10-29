type Node = {
  readonly '@id': string;
  readonly '@type': Set<string>;
};

interface StoreController {
  (transactor: StoreTransactor): void;
}

interface StoreTransactor {
  upsertNode(node: Node): void;
}

class Store {
  constructor(controller: StoreController) {
    const transactor: StoreTransactor = {
      upsertNode: (node: Node) => {
        this.#state.set(node['@id'], node);
        this.#notifyAll();
      }
    };

    controller(transactor);
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
