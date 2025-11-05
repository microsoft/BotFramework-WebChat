import { applyMiddleware, type Middleware } from 'handler-chain';
import type { Identifier } from './schemas/Identifier';

type SubscriberRecord = {
  readonly upsertedNodeIdentifiers: ReadonlySet<Identifier>;
};

type Subscriber = (event: SubscriberRecord) => void;

type GraphNode = { '@id': Identifier };

type GraphMiddleware<TInput extends GraphNode, TOutput extends GraphNode> = Middleware<
  ReadonlyMap<Identifier, TOutput>,
  ReadonlyMap<Identifier, TInput>,
  { readonly getState: () => GraphState<TOutput> }
>;

type GraphState<T extends GraphNode = GraphNode> = ReadonlyMap<Identifier, T>;

type ReadableGraph<TInput extends GraphNode, TOutput extends GraphNode> = {
  readonly act: (fn: (graph: WritableGraph<TInput, TOutput>) => void) => void;
  readonly getState: () => GraphState<TOutput>;
  readonly subscribe: (subscriber: Subscriber) => void;
};

type WritableGraph<TInput extends GraphNode, TOutput extends GraphNode> = {
  readonly getState: () => GraphState<TOutput>;
  readonly upsert: (...nodes: readonly TInput[]) => void;
};

class Graph2<TInput extends GraphNode, TOutput extends GraphNode = TInput> implements ReadableGraph<TInput, TOutput> {
  #busy = false;
  #middleware: GraphMiddleware<TInput, TOutput>;
  #state: GraphState<TOutput> = Object.freeze(new Map());
  #subscribers: Set<Subscriber> = new Set();

  constructor(
    firstMiddleware: GraphMiddleware<TInput, TOutput>,
    ...restMiddleware: readonly GraphMiddleware<TInput, TOutput>[]
  ) {
    // Interleaves every middleware with a Object.freeze(request) to protect request.
    this.#middleware = applyMiddleware(
      firstMiddleware,
      ...restMiddleware.flatMap<GraphMiddleware<TInput, TOutput>>(middleware => [
        () => next => request => next(Object.freeze(request)),
        middleware
      ])
    );
  }

  act(fn: (graph: WritableGraph<TInput, TOutput>) => void) {
    if (this.#busy) {
      throw new Error('Another transaction is ongoing');
    }

    this.#busy = true;

    try {
      const getState = this.getState.bind(this);
      const upsertedNodes = new Map<Identifier, TInput>();

      fn(
        Object.freeze({
          getState,
          upsert(...nodes: readonly TInput[]) {
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

      const nextState = new Map<Identifier, TOutput>(this.#state);
      const upsertedNodeIdentifiers = new Set<Identifier>();

      for (const enhancedNode of this.#middleware({ getState })(() => {
        throw new Error('At least one middleware must not fallthrough');
      })(Object.freeze(upsertedNodes)).values()) {
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

  getState(): GraphState<TOutput> {
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
