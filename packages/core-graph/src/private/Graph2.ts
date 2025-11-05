import { map, pipe, readonly } from 'valibot';
import { slantNode, type SlantNode } from './schemas/colorNode';
import type { Identifier } from './schemas/Identifier';
import identifier from './schemas/Identifier';

type Subscriber = (changed: ReadonlySet<Identifier>) => void;

type ReadableGraph = {
  readonly act: (fn: (graph: WritableGraph) => void) => void;
  readonly getState: () => ReadonlyMap<Identifier, SlantNode>;
  readonly subscribe: (subscriber: Subscriber) => void;
};

const stateSchema = pipe(map(identifier(), slantNode()), readonly());

type State = ReadonlyMap<Identifier, SlantNode>;

type WritableGraph = {
  readonly getState: () => ReadonlyMap<Identifier, SlantNode>;
  readonly upsert: (node: object) => void;
};

class Graph2 implements ReadableGraph {
  #busy = false;
  #state: ReadonlyMap<Identifier, SlantNode> = Object.freeze(new Map());
  #subscribers: Set<Subscriber> = new Set();

  act(fn: (graph: WritableGraph) => void) {
    if (this.#busy) {
      throw new Error('Another transaction is ongoing');
    }

    this.#busy = true;

    const changedIds = new Set<Identifier>();
    const nextState = new Map<Identifier, SlantNode>(this.#state);

    try {
      fn({
        getState() {
          return Object.freeze(nextState);
        },
        upsert(node) {
          // TODO: Convert to SlantNode[].
          const slantNode: SlantNode = Object.freeze({ ...node } as SlantNode);

          nextState.set(slantNode['@id'], slantNode);
          changedIds.add(slantNode['@id']);
        }
      } satisfies WritableGraph);
    } finally {
      if (changedIds.size) {
        Object.freeze(changedIds);

        this.#state = nextState;

        for (const subscriber of this.#subscribers) {
          subscriber(changedIds);
        }
      }

      this.#busy = false;
    }
  }

  getState(): ReadonlyMap<Identifier, SlantNode> {
    return this.#state;
  }

  subscribe(subscriber: Subscriber): () => void {
    this.#subscribers.add(subscriber);

    return () => {
      this.#subscribers.delete(subscriber);
    };
  }
}

export default Graph2;
export { stateSchema, type State };
