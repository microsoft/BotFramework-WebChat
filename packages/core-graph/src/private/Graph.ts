import { applyMiddleware, type Middleware } from 'handler-chain';
import { iteratorEvery } from 'iter-fest';
import { assert, check, map, object, pipe } from 'valibot';
import { IdentifierSchema, type Identifier } from './schemas/Identifier';

type GraphSubscriberRecord = {
  readonly upsertedNodeIdentifiers: ReadonlySet<Identifier>;
};

type GraphSubscriber = (event: GraphSubscriberRecord) => void;

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
  readonly subscribe: (subscriber: GraphSubscriber) => void;
};

type WritableGraph<TInput extends GraphNode, TOutput extends GraphNode> = {
  readonly getState: () => GraphState<TOutput>;
  readonly upsert: (...nodes: readonly TInput[]) => void;
};

const requestSchema = pipe(
  map(IdentifierSchema, object({ '@id': IdentifierSchema })),
  check(
    // TODO: [P4] Iterator.every is since iOS 18.4, we still need to use ponyfill until we drop support of iOS 18.4.
    value => iteratorEvery(value.entries(), ([key, node]) => key === node['@id']),
    'Key returned in Map must match `@id` in value'
  )
);

const middlewareValidator: GraphMiddleware<any, any> = () => next => request => {
  assert(requestSchema, request);

  const result = next(Object.freeze(request));

  assert(requestSchema, result);

  return Object.freeze(result);
};

class Graph<TInput extends GraphNode, TOutput extends GraphNode = TInput> implements ReadableGraph<TInput, TOutput> {
  #busy = false;
  #middleware: GraphMiddleware<TInput, TOutput>;
  #state: GraphState<TOutput> = Object.freeze(new Map());
  #subscribers: Set<GraphSubscriber> = new Set();

  constructor(
    firstMiddleware: GraphMiddleware<TInput, TOutput>,
    ...restMiddleware: readonly GraphMiddleware<TInput, TOutput>[]
  ) {
    // Interleaves every middleware with a validator to protect request.
    this.#middleware = applyMiddleware(
      middlewareValidator,
      ...[firstMiddleware, ...restMiddleware].flatMap<GraphMiddleware<TInput, TOutput>>(middleware => [
        middleware,
        middlewareValidator
      ])
    );
  }

  act(fn: (graph: WritableGraph<TInput, TOutput>) => void) {
    if (this.#busy) {
      throw new Error('Another transaction is ongoing');
    }

    this.#busy = true;

    let record: GraphSubscriberRecord | undefined;

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
                console.warn(
                  `botframework-webchat: Should NOT upsert a node multiple times in a single transaction (@id = "${id}")`
                );
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
        record = Object.freeze({ upsertedNodeIdentifiers: Object.freeze(upsertedNodeIdentifiers) });
      }
    } finally {
      this.#busy = false;
    }

    if (record) {
      for (const subscriber of this.#subscribers) {
        subscriber(record);
      }
    }
  }

  getState(): GraphState<TOutput> {
    return this.#state;
  }

  subscribe(subscriber: GraphSubscriber): () => void {
    this.#subscribers.add(subscriber);

    return () => {
      this.#subscribers.delete(subscriber);
    };
  }
}

export default Graph;
export {
  type GraphMiddleware,
  type GraphNode,
  type GraphState,
  type GraphSubscriber,
  type GraphSubscriberRecord,
  type ReadableGraph,
  type WritableGraph
};
