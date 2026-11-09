import type { Notify, Source } from '../types';

type Cell<T> = Source<T> & {
  /** Sets the value and calls the listeners, if the value changed (`Object.is`). A listener that throws stops the others. */
  readonly set: (value: T) => void;
};

/**
 * A value with listeners, as a slice of the Redux store: listeners are called once per change, through `notify`.
 *
 * As with `store.subscribe()` of Redux, a listener that throws stops the listeners after it, and the error is thrown
 * to the caller of `set()`.
 */
export default function createCell<T>(initialValue: T, notify: Notify): Cell<T> {
  const listeners = new Set<() => void>();
  let value = initialValue;

  return Object.freeze({
    get: () => value,
    set: (nextValue: T) => {
      if (!Object.is(nextValue, value)) {
        value = nextValue;

        notify(() => {
          for (const listener of Array.from(listeners)) {
            listener();
          }
        });
      }
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    }
  });
}

export type { Cell };
