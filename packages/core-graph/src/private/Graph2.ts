import { applyMiddleware, type Enhancer, type Middleware } from 'handler-chain';
import type { Identifier } from './schemas/Identifier';

type Subscriber = (changed: ReadonlySet<Identifier>) => void;

type ReadableGraph<T extends GraphNode> = {
  readonly act: (fn: (graph: WritableGraph<T>) => void) => void;
  readonly getState: () => ReadonlyMap<Identifier, T>;
  readonly subscribe: (subscriber: Subscriber) => void;
};

type State<T extends GraphNode = GraphNode> = ReadonlyMap<Identifier, T>;

type WritableGraph<T extends GraphNode> = {
  readonly getState: () => ReadonlyMap<Identifier, T>;
  readonly upsert: (node: T) => void;
};

type GraphNode = { '@id': Identifier };

type GraphEnhancer<T> = Enhancer<readonly T[], readonly T[]>;
type GraphMiddleware<T extends GraphNode> = Middleware<readonly T[], readonly T[], void>;

const PASSTHRU_FUNCTION = <T>(nodes: T): T => nodes;

class Graph2<T extends GraphNode> implements ReadableGraph<T> {
  #busy = false;
  #middleware: GraphMiddleware<T>;
  #state: State<T> = Object.freeze(new Map());
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

    const changedIds = new Set<Identifier>();
    const nextState = new Map<Identifier, T>(this.#state);

    try {
      const enhancer: GraphEnhancer<T> = this.#middleware();
      const writableGraph: WritableGraph<T> = Object.freeze({
        getState: () => Object.freeze(new Map(nextState)),
        upsert(node: T) {
          const enhancedNodes = enhancer!(PASSTHRU_FUNCTION)(Object.freeze([node]));

          for (const enhancedNode of enhancedNodes) {
            nextState.set(enhancedNode['@id'], Object.freeze({ ...enhancedNode }));
            changedIds.add(enhancedNode['@id']);
          }
        }
      } satisfies WritableGraph<T>);

      fn(writableGraph);
    } finally {
      if (changedIds.size) {
        Object.freeze(changedIds);

        this.#state = Object.freeze(nextState);

        for (const subscriber of this.#subscribers) {
          subscriber(changedIds);
        }
      }

      this.#busy = false;
    }
  }

  getState(): State<T> {
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
export { type State };
