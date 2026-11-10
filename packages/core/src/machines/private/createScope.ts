import createPromiseQueue from '../../createPromiseQueue';
import { CONNECT_FULFILLING } from '../../actions/connect';
import { DISCONNECT_PENDING } from '../../actions/disconnect';
import { RECONNECT_FULFILLING, RECONNECT_PENDING } from '../../actions/reconnect';
import type { MachineAction, MachineHost, Match, OnlineSession, Scope, Subscribable } from '../types';
import type { Channel } from './createChannel';
import { markPut } from './createChannel';
import { asap, immediately } from './scheduler';

type Env = {
  readonly channel: Channel;
  readonly host: MachineHost;
};

type Parent = {
  readonly childEnded: (child: Node) => void;
  readonly childFailed: (child: Node, error: unknown) => void;
};

type Node = Parent & {
  readonly scope: Scope;
  readonly start: (body: (scope: Scope) => void) => void;
  readonly stop: () => void;
};

// What a scope waits for: stopping the scope cancels it.
type Effect = { readonly cancel: () => void };

const NOOP = () => undefined;

const isOnline = ({ type }: MachineAction) => type === CONNECT_FULFILLING || type === RECONNECT_FULFILLING;
const isOffline = ({ type }: MachineAction) => type === DISCONNECT_PENDING || type === RECONNECT_PENDING;

/**
 * A scope, as a task of redux-saga: running while it waits for something (its effects) or its forked scopes run.
 *
 * - Done: once it waits for nothing after a callback, its `finally()` callbacks run; it ends when its children end.
 * - Stopped (`cancel(task)`): its effects are cancelled, its `finally()` callbacks run (`cancelled`), then its children
 *   stop, in the order they were forked.
 * - Failed (a callback threw): as stopped, but `finally()` gets `false`; then its parent fails, its `finally()`
 *   callbacks getting `true` (as the main task of a saga aborted by a child), up to the root.
 */
export default function createScope(env: Env, parent: Parent | undefined): Node {
  const { channel, host } = env;
  const children: Node[] = [];
  const effects = new Set<Effect>();
  const finallies: ((cancelled: boolean) => void)[] = [];
  let finalliesRan = false;
  let state: 'done' | 'failed' | 'running' | 'stopped' = 'running';

  const addEffect = (cancel: () => void = NOOP): Effect => {
    const effect = { cancel };

    effects.add(effect);

    return effect;
  };

  const runFinallies = (cancelled: boolean) => {
    if (!finalliesRan) {
      finalliesRan = true;

      for (const fn of finallies.splice(0).reverse()) {
        fn(cancelled);
      }
    }
  };

  const cancelEffects = () => {
    const pending = Array.from(effects);

    effects.clear();
    pending.forEach(({ cancel }) => cancel());
  };

  const stopChildren = () => {
    for (const child of children.splice(0)) {
      child.stop();
    }
  };

  // eslint-disable-next-line prefer-const
  let node: Node;

  const checkDone = () => {
    if (state === 'running' && !effects.size) {
      runFinallies(false);

      if (!children.length) {
        state = 'done';
        parent?.childEnded(node);
      }
    }
  };

  const fail = (error: unknown) => {
    if (state === 'stopped') {
      // As redux-saga: an error of a saga being cancelled goes to the caller.
      throw error;
    } else if (state !== 'running') {
      return;
    }

    state = 'failed';
    cancelEffects();
    runFinallies(false);
    stopChildren();

    if (parent) {
      parent.childFailed(node, error);
    } else {
      host.onError(error);
    }
  };

  // Calls back from what the scope waited for: an error fails the scope. As a saga resumed outside of a task: what it
  // forks runs before it goes on, and what they put runs once it waits again.
  const run = (fn: () => void) => {
    if (state === 'running') {
      try {
        immediately(fn);
      } catch (error) {
        fail(error);

        return;
      }

      checkDone();
    }
  };

  const settle = (effect: Effect): boolean => effects.delete(effect);

  const take = (match: Match, then: (action: MachineAction) => void) => {
    // eslint-disable-next-line prefer-const
    let effect: Effect;
    const stopTaking = channel.take(match, action => {
      settle(effect);
      run(() => then(action));
    });

    effect = addEffect(stopTaking);

    return () => {
      settle(effect) && stopTaking();
    };
  };

  const wait = <T>(
    promise: PromiseLike<T>,
    then: (value: T) => void,
    onError?: ((error: unknown) => void) | undefined,
    cancel: () => void = NOOP
  ) => {
    const effect = addEffect(cancel);

    promise.then(
      value => settle(effect) && run(() => then(value)),
      error =>
        settle(effect) &&
        run(() => {
          if (!onError) {
            throw error;
          }

          onError(error);
        })
    );

    return () => {
      settle(effect) && cancel();
    };
  };

  const fork = (body: (scope: Scope) => void): Scope => {
    const child = createScope(env, node);

    children.push(child);
    immediately(() => child.start(body));

    return child.scope;
  };

  const scope: Scope = Object.freeze({
    finally: (fn: (cancelled: boolean) => void) => {
      finallies.push(fn);
    },
    fork,
    observeEach: <T>(observable: Subscribable<T>, worker: (value: T, next: () => void) => void) => {
      const { push, shift } = createPromiseQueue();
      const subscription = observable.subscribe({ next: push });

      addEffect(() => subscription.unsubscribe());

      const next = () => {
        state === 'running' && wait(shift() as Promise<T>, value => worker(value, next));
      };

      next();
    },
    observeOnce: <T>(
      observable: Subscribable<T>,
      then: (value: T | undefined) => void,
      onError?: ((error: unknown) => void) | undefined
    ) => {
      let subscription: { unsubscribe(): void } | undefined;
      const unsubscribe = () => subscription?.unsubscribe();

      wait(
        new Promise<T | undefined>((resolve, reject) => {
          subscription = observable.subscribe({ complete: () => resolve(undefined), error: reject, next: resolve });
        }),
        value => {
          unsubscribe();
          then(value);
        },
        error => {
          unsubscribe();

          if (!onError) {
            throw error;
          }

          onError(error);
        },
        unsubscribe
      );
    },
    on: (match: Match, worker: (action: MachineAction, scope: Scope) => void) => {
      const loop = () =>
        take(match, action => {
          fork(child => worker(action, child));
          loop();
        });

      loop();
    },
    onLatest: (match: Match, worker: (action: MachineAction, scope: Scope) => void) => {
      let last: Scope | undefined;

      const loop = () =>
        take(match, action => {
          last?.stop();
          last = fork(child => worker(action, child));
          loop();
        });

      loop();
    },
    ponyfill: host.ponyfill,
    put: (action: MachineAction, then?: (() => void) | undefined, onError?: ((error: unknown) => void) | undefined) => {
      // A put from a stopped scope (a `finally()`) still runs, then goes on; one from a scope stopped meanwhile does not
      // go on, as a saga cancelled during its `put()`.
      const effect = state === 'running' ? addEffect() : undefined;

      asap(() => {
        try {
          markPut(action);
          host.dispatch(action);
        } catch (error) {
          if (!effect) {
            if (!onError) {
              throw error;
            }

            return onError(error);
          }

          return (
            settle(effect) &&
            (onError
              ? run(() => onError(error))
              : // As redux-saga, an error the scope does not catch fails it.
                fail(error))
          );
        }

        if (!effect) {
          then?.();
        } else if (settle(effect)) {
          run(() => then?.());
        }
      });
    },
    select: <T>(selector: (state: any) => T): T => selector(host.getState()),
    sleep: (ms: number, then: () => void) => {
      let handle: ReturnType<typeof host.ponyfill.setTimeout> | undefined;

      return wait(
        new Promise<void>(resolve => {
          handle = host.ponyfill.setTimeout(resolve, Math.max(ms, 0));
        }),
        then,
        undefined,
        () => host.ponyfill.clearTimeout(handle)
      );
    },
    stop: () => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      stop();
    },
    take,
    wait: <T>(promise: PromiseLike<T>, then: (value: T) => void, onError?: ((error: unknown) => void) | undefined) =>
      wait(promise, then, onError),
    whileOnline: (body: (session: OnlineSession, scope: Scope) => void) => {
      const loop = () =>
        take(isOnline, action => {
          const {
            meta: { userID, username },
            payload: { directLine }
          } = action;
          const session = fork(child => body(Object.freeze({ directLine, userID, username }), child));

          take(isOffline, () => {
            session.stop();
            loop();
          });
        });

      loop();
    }
  });

  const stop = () => {
    if (state === 'running') {
      state = 'stopped';
      cancelEffects();
      runFinallies(true);
      stopChildren();
      parent?.childEnded(node);
    }
  };

  node = Object.freeze({
    childEnded: (child: Node) => {
      const index = children.indexOf(child);

      ~index && children.splice(index, 1);
      checkDone();
    },
    childFailed: (child: Node, error: unknown) => {
      const index = children.indexOf(child);

      ~index && children.splice(index, 1);

      if (state === 'running') {
        state = 'failed';
        cancelEffects();
        runFinallies(true);
        stopChildren();

        if (parent) {
          parent.childFailed(node, error);
        } else {
          host.onError(error);
        }
      }
    },
    scope,
    start: (body: (scope: Scope) => void) => run(() => body(scope)),
    stop
  });

  return node;
}

export type { Env, Node };
