type ReadonlyKeyedStore<T> = {
  readonly get: (key: string) => T | undefined;
  /** Calls the listener after the value of the key changed, until unsubscribed. */
  readonly subscribe: (key: string, listener: () => void) => () => void;
};

type KeyedStore<T> = ReadonlyKeyedStore<T> & {
  readonly delete: (key: string) => void;
  /** Notifies the listeners of the key if the value changed. Listeners may re-render: call it after commit, e.g. from an effect. */
  readonly set: (key: string, value: T | undefined) => void;
};

/** Creates a store of values by key, which notifies only the listeners of keys whose value changed. */
export default function createKeyedStore<T>(): KeyedStore<T> {
  const eventTarget = new EventTarget();
  const values = new Map<string, T>();

  const set = (key: string, value: T | undefined): void => {
    if (!Object.is(values.get(key), value)) {
      typeof value === 'undefined' ? values.delete(key) : values.set(key, value);

      eventTarget.dispatchEvent(new Event(key));
    }
  };

  return Object.freeze({
    delete: (key: string) => set(key, undefined),
    get: (key: string) => values.get(key),
    set,
    subscribe: (key: string, listener: () => void) => {
      eventTarget.addEventListener(key, listener);

      return () => eventTarget.removeEventListener(key, listener);
    }
  });
}

export { type KeyedStore, type ReadonlyKeyedStore };
