type QueueSubscription = {
  /** Unsubscribes from the observable, and drops the values not handled yet. Can be called more than once. */
  readonly unsubscribe: () => void;
};

// The part of an observable used here: Direct Line passes RxJS observables.
type SubscribableOf<T> = {
  subscribe(observer: { next: (value: T) => void }): { unsubscribe(): void };
};

/**
 * Subscribes to an observable and hands its values to `onValue` one at a time, in order, each in its own microtask, as a
 * saga does with `createPromiseQueue()` (`observeEach()`, `call(queue.shift)`). A value emitted during `subscribe()`,
 * or while `onValue` runs, is handled after the current work.
 *
 * `onValue` must not throw: the caller catches its errors.
 */
export default function subscribeQueue<T>(
  observable: SubscribableOf<T>,
  onValue: (value: T) => void
): QueueSubscription {
  const queue: T[] = [];
  let closed = false;
  let scheduled = false;

  const run = () => {
    scheduled = false;

    if (!closed && queue.length) {
      onValue(queue.shift());

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      queue.length && schedule();
    }
  };

  const schedule = () => {
    if (!scheduled) {
      scheduled = true;

      Promise.resolve().then(run);
    }
  };

  const subscription = observable.subscribe({
    next: (value: T) => {
      if (!closed) {
        queue.push(value);
        schedule();
      }
    }
  });

  return Object.freeze({
    unsubscribe: () => {
      if (!closed) {
        closed = true;
        queue.splice(0);
        subscription.unsubscribe();
      }
    }
  });
}

export type { QueueSubscription };
