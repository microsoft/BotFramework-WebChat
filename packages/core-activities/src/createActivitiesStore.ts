import type { Store } from 'botframework-webchat-store';
import { function_, object, parse, pipe, readonly } from 'valibot';

import type { ActivitiesCoreEnv } from './ActivitiesCoreEnv';
import createInitialState from './operations/createInitialState';
import deleteActivityById from './operations/deleteActivityById';
import markActivity from './operations/markActivity';
import postActivityFulfilled from './operations/postActivityFulfilled';
import postActivityImpeded from './operations/postActivityImpeded';
import postActivityPending from './operations/postActivityPending';
import postActivityRejected from './operations/postActivityRejected';
import receiveActivity from './operations/receiveActivity';
import type { ActivitiesCoreState } from './types';
import type { WebChatActivity } from './types/WebChatActivity';

declare const process: {
  env: {
    NODE_ENV?: string | undefined;
  };
};

type ActivitiesStoreChange = {
  /** IDs of the graph nodes the operation added, updated or deleted (from the store). */
  readonly affectedNodeIds: ReadonlySet<string>;
  readonly next: ActivitiesCoreState;
  readonly previous: ActivitiesCoreState;
};

type ActivitiesStoreListener = (change: ActivitiesStoreChange) => void;

type ActivitiesStore = {
  /** Deletes the activity with the ID, if any. */
  readonly deleteActivity: (activityId: string) => void;
  /** The latest state: the same object until the next change (for `useSyncExternalStore()`). */
  readonly getSnapshot: () => ActivitiesCoreState;
  /** Sets `channelData[name]` of the activity with the ID, if any. */
  readonly markActivity: (activityId: string, name: string, value: unknown) => void;
  readonly postActivityFulfilled: (clientActivityID: string, activity: WebChatActivity) => void;
  readonly postActivityImpeded: (clientActivityID: string) => void;
  readonly postActivityPending: (activity: WebChatActivity) => void;
  readonly postActivityRejected: (clientActivityID: string) => void;
  readonly receiveActivity: (activity: WebChatActivity) => void;
  /**
   * William's store holding the activities graph, read only. It notifies its own listeners before the state is derived
   * from the graph: read the state from `getSnapshot()` in a listener of `subscribe()` instead.
   */
  readonly store: Store;
  /** Calls the listener after each operation that changed the state, once the state is derived. */
  readonly subscribe: (listener: ActivitiesStoreListener) => () => void;
};

const createActivitiesStoreInitSchema = pipe(
  object({
    ponyfill: pipe(object({ Date: function_() }), readonly())
  }),
  readonly()
);

const listenerSchema = function_();

/**
 * Holds the activities core state without Redux: the operations apply to the latest state only (no replay), and
 * listeners are called after the state is derived.
 *
 * An operation called during another one, or from a listener, is queued and runs after it, in order. When an operation
 * throws, the state stays as it was: the error is thrown to the caller, or, for a queued operation, to the caller of the
 * operation that was running, once the queue is empty.
 */
export default function createActivitiesStore(init: { readonly ponyfill: ActivitiesCoreEnv }): ActivitiesStore {
  const { ponyfill } = parse(createActivitiesStoreInitSchema, init);
  const env: ActivitiesCoreEnv = Object.freeze({ Date: ponyfill.Date as DateConstructor });
  const listeners = new Set<ActivitiesStoreListener>();
  const queue: ((state: ActivitiesCoreState) => ActivitiesCoreState)[] = [];
  let affectedNodeIdsList: ReadonlySet<string>[] | undefined;
  let running = false;
  let state = createInitialState();

  // `createInitialState()` creates the graph: this store is its only source.
  const { graph } = state;

  if (!graph) {
    throw new Error('botframework-webchat: The initial state has no graph');
  }

  // The initial state does not record the snapshot of its graph (`graphSnapshot`), so the first operation on it would
  // build a new graph (as the reducer does on its first action). Recording it keeps this graph, from the first operation.
  state = Object.freeze({ ...state, graphSnapshot: graph.store.getSnapshot() });

  graph.store.subscribe(affectedNodeIds => affectedNodeIdsList?.push(affectedNodeIds));

  const apply = (operation: (state: ActivitiesCoreState) => ActivitiesCoreState): void => {
    const previous = state;
    const affectedNodeIdsOfOperation: ReadonlySet<string>[] = [];

    affectedNodeIdsList = affectedNodeIdsOfOperation;

    let next: ActivitiesCoreState;

    try {
      next = operation(previous);
    } finally {
      affectedNodeIdsList = undefined;
    }

    // The state is always the latest one, so the operations never rebuild the graph from an older snapshot.
    if (process.env.NODE_ENV !== 'production' && next.graph !== graph) {
      throw new Error('botframework-webchat internal: The activities store must keep its graph');
    }

    if (next === previous) {
      return;
    }

    state = next;

    const change: ActivitiesStoreChange = Object.freeze({
      affectedNodeIds:
        affectedNodeIdsOfOperation.length === 1
          ? affectedNodeIdsOfOperation[0]
          : new Set(affectedNodeIdsOfOperation.flatMap(affectedNodeIds => Array.from(affectedNodeIds))),
      next,
      previous
    });

    let listenerError: { readonly error: unknown } | undefined;

    for (const listener of Array.from(listeners)) {
      try {
        listener(change);
      } catch (error) {
        listenerError ??= { error };
      }
    }

    if (listenerError) {
      throw listenerError.error;
    }
  };

  const run = (operation: (state: ActivitiesCoreState) => ActivitiesCoreState): void => {
    if (running) {
      queue.push(operation);

      return;
    }

    running = true;

    let firstError: { readonly error: unknown } | undefined;

    try {
      for (let next: typeof operation | undefined = operation; next; next = queue.shift()) {
        try {
          apply(next);
        } catch (error) {
          firstError ??= { error };
        }
      }
    } finally {
      running = false;
    }

    if (firstError) {
      throw firstError.error;
    }
  };

  return Object.freeze({
    deleteActivity: (activityId: string) => run(state => deleteActivityById(state, activityId)),
    getSnapshot: () => state,
    markActivity: (activityId: string, name: string, value: unknown) =>
      run(state => markActivity(state, activityId, name, value)),
    postActivityFulfilled: (clientActivityID: string, activity: WebChatActivity) =>
      run(state => postActivityFulfilled(state, clientActivityID, activity, env)),
    postActivityImpeded: (clientActivityID: string) => run(state => postActivityImpeded(state, clientActivityID)),
    postActivityPending: (activity: WebChatActivity) => run(state => postActivityPending(state, activity, env)),
    postActivityRejected: (clientActivityID: string) => run(state => postActivityRejected(state, clientActivityID)),
    receiveActivity: (activity: WebChatActivity) => run(state => receiveActivity(state, activity, env)),
    store: graph.store,
    subscribe: (listener: ActivitiesStoreListener) => {
      listeners.add(parse(listenerSchema, listener) as ActivitiesStoreListener);

      return () => {
        listeners.delete(listener);
      };
    }
  });
}

export type { ActivitiesStore, ActivitiesStoreChange, ActivitiesStoreListener };
