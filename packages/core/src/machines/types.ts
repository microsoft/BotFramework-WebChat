import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';

/** An action, as the machines take and put them: only `type` is known. */
type MachineAction = { readonly type: string; readonly [key: string]: any };

/** What a mode gives the machines. Redux mode: the middleware API of the store. */
type MachineHost = {
  /** Dispatches through the whole chain (the host's middleware too), as a saga `put()` does. */
  readonly dispatch: (action: MachineAction) => unknown;
  /** The state after the reducers, as a saga `select()` reads it. */
  readonly getState: () => any;
  /** Called once with an error that no machine caught, after every machine stopped (as redux-saga's `onError`). */
  readonly onError: (error: unknown) => void;
  readonly ponyfill: GlobalScopePonyfill;
};

/** The Direct Line session of `whileOnline()`, from the meta and payload of `*_FULFILLING`. */
type OnlineSession = {
  readonly directLine: any;
  readonly userID: string;
  readonly username: string;
};

type Match = (action: MachineAction) => unknown;

type Subscribable<T> = {
  subscribe(observer: {
    complete?: (() => void) | undefined;
    error?: ((error: unknown) => void) | undefined;
    next: (value: T) => void;
  }): { unsubscribe(): void };
};

/**
 * Where a machine runs, as a saga task: what it waits for is cancelled when the scope stops, its `finally()` callbacks
 * run, then its forked scopes stop, in the order they were forked. A callback that throws fails the scope, as an
 * uncaught error fails a saga: its parent stops its other work, up to the machines, which all stop.
 *
 * Each method is the effect of the same name in redux-saga, with the same timing.
 */
type Scope = {
  /** Calls `fn` when the scope ends: `true` if it was stopped, as `yield cancelled()` in a `finally` block. LIFO. */
  readonly finally: (fn: (cancelled: boolean) => void) => void;
  /** `fork()`: runs `body` in a child scope now; its puts run after the current task. */
  readonly fork: (body: (scope: Scope) => void) => Scope;
  /** `observeOnce()`: the first value, the completion or the error; unsubscribes before calling back. */
  readonly observeOnce: <T>(
    observable: Subscribable<T>,
    then: (value: T | undefined) => void,
    onError?: ((error: unknown) => void) | undefined
  ) => void;
  /** `observeEach()`: each value to `worker`, one at a time; the next one a microtask after `next()` is called. */
  readonly observeEach: <T>(observable: Subscribable<T>, worker: (value: T, next: () => void) => void) => void;
  /** `takeEvery()`: each action that matches to `worker`, in a child scope. */
  readonly on: (match: Match, worker: (action: MachineAction, scope: Scope) => void) => void;
  /** `takeLatest()`: as `on()`, stopping the previous worker first. */
  readonly onLatest: (match: Match, worker: (action: MachineAction, scope: Scope) => void) => void;
  readonly ponyfill: GlobalScopePonyfill;
  /**
   * `put()`: after the current task, dispatches the action through the whole chain, then calls `then` within the same
   * task. If the dispatch throws: `onError`, as a `try` around the `put()`, or the scope fails.
   */
  readonly put: (
    action: MachineAction,
    then?: (() => void) | undefined,
    onError?: ((error: unknown) => void) | undefined
  ) => void;
  /** `select()`. */
  readonly select: <T>(selector: (state: any) => T) => T;
  /** `call(sleep, ms)`: a microtask after the timer of the ponyfill fires. The timer is cleared if the scope stops. */
  readonly sleep: (ms: number, then: () => void) => () => void;
  /** Stops the scope (`cancel(task)`). Does nothing if it ended already. */
  readonly stop: () => void;
  /** `take()`: the next action that matches; returns the function that stops waiting (a lost `race()`). */
  readonly take: (match: Match, then: (action: MachineAction) => void) => () => void;
  /** `call(promise)`: a microtask after it settles. */
  readonly wait: <T>(
    promise: PromiseLike<T>,
    then: (value: T) => void,
    onError?: ((error: unknown) => void) | undefined
  ) => () => void;
  /**
   * `whileConnected()`: runs `body` in a child scope from `*_FULFILLING` until `DISCONNECT_PENDING` or
   * `RECONNECT_PENDING`, each time.
   */
  readonly whileOnline: (body: (session: OnlineSession, scope: Scope) => void) => void;
};

/** A machine: what one saga did, started in its scope. */
type Machine = (scope: Scope) => void;

export type { Machine, MachineAction, MachineHost, Match, OnlineSession, Scope, Subscribable };
