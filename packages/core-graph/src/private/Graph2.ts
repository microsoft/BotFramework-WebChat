import { applyMiddleware, type Middleware } from 'handler-chain';
import type { Identifier } from './schemas/Identifier';

type SubscriberRecord = {
  readonly upsertedNodeIdentifiers: ReadonlySet<Identifier>;
};

type Subscriber = (event: SubscriberRecord) => void;

type GraphNode = { '@id': Identifier };

type GraphMiddleware<T extends GraphNode> = Middleware<
  ReadonlyMap<Identifier, T>,
  ReadonlyMap<Identifier, T>,
  { readonly getState: () => GraphState<T> }
>;

type GraphState<T extends GraphNode = GraphNode> = ReadonlyMap<Identifier, T>;

type ReadableGraph<T extends GraphNode> = {
  readonly act: (fn: (graph: WritableGraph<T>) => void) => void;
  readonly getState: () => GraphState<T>;
  readonly subscribe: (subscriber: Subscriber) => void;
};

type WritableGraph<T extends GraphNode> = {
  readonly getState: () => GraphState<T>;
  readonly upsert: (...nodes: readonly T[]) => void;
};

const PASSTHRU_FUNCTION = <T>(nodes: T): T => nodes;

class Graph2<T extends GraphNode> implements ReadableGraph<T> {
  #busy = false;
  #middleware: GraphMiddleware<T>;
  #state: GraphState<T> = Object.freeze(new Map());
  #subscribers: Set<Subscriber> = new Set();

  constructor(...middleware: readonly GraphMiddleware<T>[]) {
    // Interleaves every middleware with a Object.freeze(request) to protect request.
    this.#middleware = applyMiddleware(
      ...middleware
        .flatMap<GraphMiddleware<T>>(middleware => [middleware, () => next => request => next(Object.freeze(request))])
        // Drop the very last protection, we just need to interleave middleware, no need for the very last one.
        // eslint-disable-next-line no-magic-numbers
        .slice(0, -1)
    );
  }

  act(fn: (graph: WritableGraph<T>) => void) {
    if (this.#busy) {
      throw new Error('Another transaction is ongoing');
    }

    this.#busy = true;

    try {
      const getState = this.getState.bind(this);
      const upsertedNodeIdentifiers = new Set<Identifier>();
      const nextState = new Map<Identifier, T>(this.#state);
      const upsertedNodes = new Map<Identifier, T>();

      fn(
        Object.freeze({
          getState,
          upsert(...nodes: readonly T[]) {
            for (const node of nodes) {
              const id = node['@id'];

              if (upsertedNodes.has(id)) {
                throw new Error(`Cannot upsert a node multiple times in a single transaction (@id = "${id}")`);
              }

              upsertedNodes.set(id, node);
            }
          }
        })
      );

      for (const enhancedNode of this.#middleware({ getState })(PASSTHRU_FUNCTION)(
        Object.freeze(upsertedNodes)
      ).values()) {
        nextState.set(enhancedNode['@id'], Object.freeze({ ...enhancedNode }));
        upsertedNodeIdentifiers.add(enhancedNode['@id']);
      }

      if (upsertedNodeIdentifiers.size) {
        this.#state = Object.freeze(nextState);

        // After this line, there must be no more write operations on this object instance.
        const record = Object.freeze({ upsertedNodeIdentifiers: Object.freeze(upsertedNodeIdentifiers) });

        for (const subscriber of this.#subscribers) {
          subscriber(record);
        }
      }
    } finally {
      this.#busy = false;
    }
  }

  getState(): GraphState<T> {
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
export {
  type GraphMiddleware,
  type GraphNode,
  type GraphState,
  type ReadableGraph,
  type Subscriber,
  type SubscriberRecord,
  type WritableGraph
};
