type Emitter<TArgs extends unknown[]> = {
  /** Calls the listeners in the order they subscribed. A listener that throws stops the others; the error is thrown. */
  readonly emit: (...args: TArgs) => void;
  /** Adds a listener; returns the function that removes it. */
  readonly subscribe: (listener: (...args: TArgs) => void) => () => void;
};

/**
 * Events without a value to keep, e.g. "the suggested actions are set or cleared": the listeners subscribed when an event
 * is emitted are called with it, in order.
 */
export default function createEmitter<TArgs extends unknown[]>(): Emitter<TArgs> {
  const listeners = new Set<(...args: TArgs) => void>();

  return Object.freeze({
    emit: (...args: TArgs) => {
      for (const listener of Array.from(listeners)) {
        listener(...args);
      }
    },
    subscribe: (listener: (...args: TArgs) => void) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    }
  });
}

export type { Emitter };
