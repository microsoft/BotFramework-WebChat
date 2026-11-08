/* eslint-disable no-restricted-globals */
// The direct adapter: listeners are called after the state is derived, operations called from a listener are queued,
// a failed operation keeps the state, and there is one graph.
import { scenario } from '@testduet/given-when-then';
import createActivitiesStore, { type ActivitiesStoreChange } from './createActivitiesStore';
import type { Activity } from './types';

const ponyfill = { Date };

function botActivity(id: string, text: string, timestamp: number): Activity {
  return {
    channelData: {},
    from: { id: 'bot', role: 'bot' },
    id,
    text,
    timestamp: new Date(timestamp).toISOString(),
    type: 'message'
  } as unknown as Activity;
}

const ids = ({ sortedActivities }: { readonly sortedActivities: readonly Activity[] }) =>
  sortedActivities.map(({ id }) => id);

scenario('createActivitiesStore()', bdd => {
  bdd
    .given('a store', () => createActivitiesStore({ ponyfill }))
    .when('nothing happened', store => store)
    .then('should be empty', (_, store) => expect(store.getSnapshot().sortedActivities).toEqual([]))
    .and('should read the graph of its state', (_, store) =>
      expect(store.store.getSnapshot()).toBe(store.getSnapshot().graph?.store.getSnapshot())
    )
    .and('should not expose the store of the graph', (_, store) =>
      expect(store.store).not.toBe(store.getSnapshot().graph?.store)
    )
    .and('should be frozen', (_, store) => expect(Object.isFrozen(store)).toBe(true));

  bdd
    .given('nothing', () => undefined)
    .when('a store is created without a ponyfill', () => {
      try {
        createActivitiesStore({} as any);
      } catch (error) {
        return error;
      }

      return undefined;
    })
    .then('should throw', (_, error) => expect(error).toBeInstanceOf(Error));
});

scenario('subscribe()', bdd => {
  bdd
    .given('a store with a listener, and a listener on its graph', () => {
      const store = createActivitiesStore({ ponyfill });
      const changes: { change: ActivitiesStoreChange; snapshot: unknown }[] = [];
      const graphReads: string[][] = [];

      store.subscribe(change => changes.push({ change, snapshot: store.getSnapshot() }));
      store.store.subscribe(() => graphReads.push(ids(store.getSnapshot()).map(String)));

      return { changes, graphReads, store };
    })
    .when('a-1 arrives', ({ store }) => {
      const previous = store.getSnapshot();

      store.receiveActivity(botActivity('a-1', 'one', 1_000));

      return { previous };
    })
    .then('should call the listener once, with the derived state', ({ changes, store }, { previous }) => {
      expect(changes).toHaveLength(1);
      expect(changes[0]?.change.previous).toBe(previous);
      expect(changes[0]?.change.next).toBe(store.getSnapshot());
      expect(changes[0]?.snapshot).toBe(store.getSnapshot());
      expect(ids(changes[0]!.change.next)).toEqual(['a-1']);
    })
    .and('should pass the IDs of the changed nodes', ({ changes, store }) =>
      expect([...changes[0]!.change.affectedNodeIds]).toContain(
        store.getSnapshot().sortedActivities[0]?.channelData['webchat:internal:local-id']
      )
    )
    // The store notifies at the end of its transaction, before the state is derived from the graph.
    .and('should call the graph listener before the state is derived', ({ graphReads }) =>
      expect(graphReads).toEqual([[]])
    );

  bdd
    .given('a store with a-1 and a listener', () => {
      const store = createActivitiesStore({ ponyfill });
      const listener = jest.fn();

      store.receiveActivity(botActivity('a-1', 'one', 1_000));

      const unsubscribe = store.subscribe(listener);

      return { listener, store, unsubscribe };
    })
    .when('a-2 is deleted (unknown), then the listener unsubscribes and a-3 arrives', ({ store, unsubscribe }) => {
      const before = store.getSnapshot();

      store.deleteActivity('a-2');

      const afterDelete = store.getSnapshot();

      unsubscribe();
      store.receiveActivity(botActivity('a-3', 'three', 3_000));

      return { afterDelete, before };
    })
    .then('should keep the same state when nothing changed', (_, { afterDelete, before }) =>
      expect(afterDelete).toBe(before)
    )
    .and('should not call the listener', ({ listener }) => expect(listener).not.toHaveBeenCalled())
    .and('should still apply a-3', ({ store }) => expect(ids(store.getSnapshot())).toEqual(['a-1', 'a-3']));
});

scenario('operations called during an operation', bdd => {
  bdd
    .given('a store whose listener replies to a-1 with a-2, and whose graph listener sends a-3 on a-2', () => {
      const store = createActivitiesStore({ ponyfill });
      const seen: string[][] = [];

      store.subscribe(({ next }) => {
        seen.push(ids(next).map(String));

        ids(next).includes('a-1') &&
          !ids(next).includes('a-2') &&
          store.receiveActivity(botActivity('a-2', 'two', 2_000));
      });

      store.store.subscribe(() => {
        const { sortedActivities } = store.getSnapshot();

        // The graph listener reads the state before this transaction (a-1 only, while a-2 is written).
        sortedActivities.length === 1 && store.receiveActivity(botActivity('a-3', 'three', 3_000));
      });

      return { seen, store };
    })
    .when('a-1 arrives', ({ store }) => {
      const { graph } = store.getSnapshot();

      store.receiveActivity(botActivity('a-1', 'one', 1_000));

      return { graph };
    })
    .then('should run the queued operations after, in order', ({ seen }) =>
      expect(seen).toEqual([['a-1'], ['a-1', 'a-2'], ['a-1', 'a-2', 'a-3']])
    )
    .and('should end with all three', ({ store }) => expect(ids(store.getSnapshot())).toEqual(['a-1', 'a-2', 'a-3']))
    .and('should keep its graph', ({ store }, { graph }) => expect(store.getSnapshot().graph).toBe(graph));
});

scenario('an operation that throws', bdd => {
  bdd
    .given('a store with a-1 and a listener', () => {
      const store = createActivitiesStore({ ponyfill });
      const listener = jest.fn();

      store.receiveActivity(botActivity('a-1', 'one', 1_000));
      store.subscribe(listener);

      return { listener, store };
    })
    .when('an unknown outgoing activity is fulfilled', ({ store }) => {
      const before = store.getSnapshot();

      try {
        store.postActivityFulfilled('c-1', botActivity('u-1', 'one', 1_000));
      } catch (error) {
        return { before, error };
      }

      return { before, error: undefined };
    })
    .then('should throw', (_, { error }) => expect(error).toBeInstanceOf(Error))
    .and('should keep the state', ({ store }, { before }) => expect(store.getSnapshot()).toBe(before))
    .and('should not call the listener', ({ listener }) => expect(listener).not.toHaveBeenCalled())
    .and('should apply the next operation', ({ store }) => {
      store.receiveActivity(botActivity('a-2', 'two', 2_000));

      expect(ids(store.getSnapshot())).toEqual(['a-1', 'a-2']);
    });
});

// Runs the function with `process.env.NODE_ENV` set: the store checks that it keeps its graph in development only.
function withNodeEnv<T>(nodeEnv: string, fn: () => T): T {
  const nodeEnvBefore = process.env.NODE_ENV;

  process.env.NODE_ENV = nodeEnv;

  try {
    return fn();
  } finally {
    process.env.NODE_ENV = nodeEnvBefore;
  }
}

function receiveEach(store: ReturnType<typeof createActivitiesStore>, activities: readonly Activity[]): unknown[] {
  const errors: unknown[] = [];

  for (const activity of activities) {
    try {
      store.receiveActivity(activity);
    } catch (error) {
      errors.push(error);
    }
  }

  return errors;
}

scenario('a listener that throws', bdd => {
  for (const nodeEnv of ['development', 'production']) {
    bdd
      .given(`in ${nodeEnv}, a store with a graph listener that throws, another graph listener and a listener`, () => {
        const store = createActivitiesStore({ ponyfill });
        const error = new Error('graph listener');
        const graphListener = jest.fn();
        const listener = jest.fn();

        store.store.subscribe(() => {
          throw error;
        });
        store.store.subscribe(graphListener);
        store.subscribe(listener);

        return { error, graph: store.getSnapshot().graph, graphListener, listener, store };
      })
      .when('a-1, then a-2 arrive', ({ store }) =>
        withNodeEnv(nodeEnv, () =>
          receiveEach(store, [botActivity('a-1', 'one', 1_000), botActivity('a-2', 'two', 2_000)])
        )
      )
      .then('should throw the error of the listener each time', ({ error }, errors) =>
        expect(errors).toEqual([error, error])
      )
      .and('should apply both', ({ store }) => expect(ids(store.getSnapshot())).toEqual(['a-1', 'a-2']))
      .and('should keep its graph', ({ graph, store }) => expect(store.getSnapshot().graph).toBe(graph))
      .and('should read from the graph the state was derived from', ({ store }) =>
        expect(store.store.getSnapshot()).toBe(store.getSnapshot().graphSnapshot)
      )
      .and('should call the other listeners each time', ({ graphListener, listener }) => {
        expect(graphListener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenCalledTimes(2);
      });
  }

  bdd
    .given('a store with a listener that throws, and another listener', () => {
      const store = createActivitiesStore({ ponyfill });
      const error = new Error('listener');
      const listener = jest.fn();

      store.subscribe(() => {
        throw error;
      });
      store.subscribe(listener);

      return { error, listener, store };
    })
    .when('a-1, then a-2 arrive', ({ store }) =>
      receiveEach(store, [botActivity('a-1', 'one', 1_000), botActivity('a-2', 'two', 2_000)])
    )
    .then('should throw the error of the listener each time', ({ error }, errors) =>
      expect(errors).toEqual([error, error])
    )
    .and('should apply both', ({ store }) => expect(ids(store.getSnapshot())).toEqual(['a-1', 'a-2']))
    .and('should call the other listener each time, with the derived state', ({ listener, store }) => {
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener.mock.calls[1]?.[0].next).toBe(store.getSnapshot());
    });
});

scenario('unsubscribing during a notification', bdd => {
  bdd
    .given('a store whose first listener unsubscribes the second, on its graph and on itself', () => {
      const store = createActivitiesStore({ ponyfill });
      const graphListener = jest.fn();
      const listener = jest.fn();
      let unsubscribeGraphListener: () => void = () => undefined;
      let unsubscribeListener: () => void = () => undefined;

      store.store.subscribe(() => unsubscribeGraphListener());
      unsubscribeGraphListener = store.store.subscribe(graphListener);
      store.subscribe(() => unsubscribeListener());
      unsubscribeListener = store.subscribe(listener);

      return { graphListener, listener, store };
    })
    .when('a-1, then a-2 arrive', ({ store }) =>
      receiveEach(store, [botActivity('a-1', 'one', 1_000), botActivity('a-2', 'two', 2_000)])
    )
    .then('should not throw', (_, errors) => expect(errors).toEqual([]))
    // As Redux: the listeners of a notification are the ones subscribed when it starts.
    .and('should still call the second listeners for a-1, not for a-2', ({ graphListener, listener }) => {
      expect(graphListener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledTimes(1);
      expect(ids(listener.mock.calls[0]?.[0].next)).toEqual(['a-1']);
    })
    .and('should apply both', ({ store }) => expect(ids(store.getSnapshot())).toEqual(['a-1', 'a-2']));
});
