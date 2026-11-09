type SagaQueue = {
  /**
   * Runs `fn`, then, if it is the outermost `batch()`, the tasks queued by `later()` meanwhile, in order (also those
   * queued by these tasks), before returning.
   */
  readonly batch: <T>(fn: () => T) => T;
  /** Inside a `batch()`, queues `fn` after the tasks already queued; outside, runs it now. */
  readonly later: (fn: () => void) => void;
};

/**
 * The order of redux-saga, for the services that do what the sagas did: one queue for all of them, as the "asap" queue
 * of redux-saga is one queue for every saga.
 *
 * In Redux mode, an action is reduced, then the sagas waiting for it run; what they `put()` is queued, and runs after
 * the current action, one at a time. A saga resumes after its own `put()` ran, so the actions put by the sagas reacting
 * to it come before its next one. Here, an operation of a service is a `batch()`, and each `put()` of a saga is one task
 * queued by `later()`, whose last step is what the saga does next.
 */
export default function createSagaQueue(): SagaQueue {
  const queue: (() => void)[] = [];
  let depth = 0;

  const batch = <T>(fn: () => T): T => {
    depth++;

    try {
      return fn();
    } finally {
      if (!--depth) {
        depth++;

        try {
          while (queue.length) {
            queue.shift()();
          }
        } finally {
          depth--;
        }
      }
    }
  };

  const later = (fn: () => void) => {
    depth ? queue.push(fn) : fn();
  };

  return Object.freeze({ batch, later });
}

export type { SagaQueue };
